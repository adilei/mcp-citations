# MCP Citations Pass-Through: Findings

## Experiment

Can Microsoft Copilot Studio (MCS) act as a pass-through for an MCP server that has its own LLM? Specifically:
1. Will MCS relay MCP tool responses **verbatim** (not rewrite, summarize, or embellish)?
2. Will MCS preserve **citations** (URLs) from the MCP response?

**Setup:** MCP server returning pre-written book expert answers with markdown citation links, tested against an MCS agent via M365 Agents SDK.

---

## Key Findings

### 1. Near-verbatim pass-through is achievable, but with caveats

**Using the main (top-level) agent directly:** Verbatim pass-through is not currently achievable. The main agent always rewrites tool output — reformatting into bullet points, adding markdown headers, stripping distinctive phrases, and sometimes adding extra content not in the tool response. No combination of tool descriptions or agent instructions prevented this.

**Using a child agent:** Near-verbatim pass-through is achievable. The text body of tool responses can pass through largely intact, but MCS's grounding layer still strips URLs it can't verify (see finding #4). True byte-for-byte verbatim is only achieved for responses where all embedded URLs pass MCS's grounding checks.

The child agent approach works because the child agent can use `SendMessageTool` to deliver the response directly to the user, bypassing the parent agent's summarization layer (see finding #3).

The best results were achieved when:
- The **child agent instructions** explicitly tell it to use `SendMessageTool` to relay the tool output
- The instructions say "do NOT return the tool output as your result" (otherwise the parent agent summarizes it)
- The tool description says the output is a "COMPLETE, FINAL response"

**Working instructions (on the child agent):**
```
## Tool Output Handling
1. Use SendMessageTool to send the ENTIRE text output from askBookExpert directly to the user.
2. Do NOT return the tool output as your own result. Always use SendMessageTool to deliver it.
3. Do NOT summarize, shorten, paraphrase, or rewrite the tool's output in any way.
4. Do NOT convert the text into bullet points, numbered lists, or markdown headers.
5. Do NOT add your own introduction, commentary, or follow-up questions.
6. Do NOT omit any sentences or paragraphs from the tool's output.
```

**MCP tool description used:**
```
Ask a sci-fi and fantasy book expert a question. This tool returns a COMPLETE, FINAL response
that is ready to be shown to the user. You MUST send the text output of this tool directly to
the user as your response. Do NOT summarize, rephrase, reformat into bullet points, or modify
the text in any way. Do NOT add your own commentary or introduction. Simply relay the exact
text as your reply.
```

### 2. The SendMessageTool path is critical

There are two code paths in MCS for delivering responses:

| Path | Mechanism | Verbatim? |
|------|-----------|-----------|
| **SendMessageTool** | Child agent passes text to SendMessageTool → delivered as single final message (0 deltas) | **Yes** |
| **Streaming** | Child agent generates its own text → streamed as deltas → parent may further summarize | **No** |

When `SendMessageTool` is used, the text is delivered as-is. When the child agent streams its own response (visible as delta activities), it always rewrites the content.

The `SendMessageTool` has a `ustSummarizationEnabled` parameter (observed set to `false` in successful passes). This appears to bypass MCS's summarization layer.

### 3. The parent agent summarizes child agent output

In a parent→child agent architecture:
- If the child agent **returns** the tool output as its result, the parent agent receives it and **summarizes** it before sending to the user
- If the child agent uses **SendMessageTool**, the text bypasses the parent agent's summarization
- This is the single most important architectural insight for achieving verbatim pass-through

### 4. MCS strips URLs from markdown links based on grounding

MCS has a grounding/safety layer that processes URLs in responses:

| URL | Stripped? | Example |
|-----|-----------|---------|
| Well-known Wikipedia pages | **No** — URL preserved | `[Dune (novel) — Wikipedia](https://en.wikipedia.org/wiki/Dune_(novel))` |
| Less-common Wikipedia pages | **Yes** — URL removed, link text kept | `[Bene Gesserit — Wikipedia](https://...)` → `Bene Gesserit — Wikipedia` |

The grounding layer appears to make a judgment about whether to allow external URLs through. Well-known pages (e.g., Dune, Neuromancer, Lord of the Rings) pass through with clickable links. More specific pages (Bene Gesserit, Paul Atreides, Dune Messiah) have their URLs stripped, leaving only the link text.

Bold markdown in the Sources section (`**Sources:**`) is also sometimes stripped to plain text (`Sources:`).

### 5. MCP resource_link blocks don't generate user-facing citations

Despite MCS correctly:
- Calling the tool and receiving `resource_link` content blocks
- Reading the resources via `ReadResource`
- Subscribing to resource updates via `Subscribe`

...it **never** generated `schema.org/Claim` citation entities from MCP resource_links. Citations in the activity protocol only appeared when MCS used its own `UniversalSearchTool`.

Embedding citation URLs as **markdown links in the text body** is the only reliable way to get citation links to the user.

### 6. MCS rephrases questions before calling MCP tools

MCS never passes the user's question directly to the MCP tool. It always rephrases:

| User asked | MCS sent to tool |
|-----------|-----------------|
| "Tell me about Dune" | "Provide a summary and key information about the novel 'Dune' by Frank Herbert, including its plot, themes, and significance." |
| "Tell me more about the Bene Gesserit" | "Explain the Bene Gesserit organization, its role, philosophy, and influence in the Dune universe." |

This means keyword-based matching on the MCP server must account for MCS's expanded vocabulary, not just the user's exact words.

### 7. MCS sometimes bypasses MCP tools entirely

Even with routing instructions, MCS occasionally chooses its own `UniversalSearchTool` instead of the MCP tool, especially for:
- Questions it considers too general
- Questions where it has high confidence in its own knowledge
- Follow-up questions in a conversation

Adding routing instructions improved this but didn't eliminate it entirely:
```
## Tool Routing
When you are unsure which tool to use for a user's question, always call askBookExpert.
The questions you receive will always be about books, even if they seem to be about characters,
themes, comparisons, or general topics. askBookExpert can handle all of these — including
follow-up questions, sub-topics, and comparisons between books.
```

### 8. Model choice significantly affects pass-through reliability

We tested three orchestrator models with identical agent instructions and MCP server:

| Model | Exact verbatim | Near-verbatim (URLs stripped) | Rewrites | Errors |
|-------|---------------|-------------------------------|----------|--------|
| **GPT-4.1** | 3–4/6 | +1–2 | 0–1 | 0–1 (rate limit) |
| **GPT-5 auto** | 2/6 | 0 | 3 | 1 (returned raw JSON) |
| **GPT-5.2 chat** | 2/6 | +2 | 0 | 1 (SystemError) |

**GPT-4.1** was the most reliable at following SendMessageTool instructions and preserving tool output verbatim. GPT-5 auto was more likely to bypass the MCP tool or rewrite the output. GPT-5.2 chat had similar verbatim rates to 4.1 for text body but was less stable (occasional SystemErrors).

### 9. Verbatim pass-through is non-deterministic

Even with identical questions and instructions, MCS sometimes produces verbatim output and sometimes rewrites. Across multiple test runs with the same configuration:
- The same question might be verbatim in one run and reformatted in the next
- The child agent's decision to use SendMessageTool vs streaming is probabilistic
- This suggests the LLM orchestrator doesn't follow instructions with 100% reliability

### 9. Rate limiting affects test reliability

`GenAIToolPlannerRateLimitReached` errors appeared after 4-5 rapid questions in a conversation. Adding 5-second delays between questions in separate conversations mostly avoided this, but it still occurred in rapid testing scenarios.

---

## Pitfalls Summary

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Parent agent summarizes child agent output | Complete rewrite into bullet points | Child agent must use SendMessageTool, not return text as result |
| Child agent rewrites before SendMessageTool | Reformatted text with headers/bullets | Explicit numbered instructions: "Do NOT convert to bullet points" |
| MCP resource_link doesn't generate citations | No clickable citation entities in activity protocol | Embed citations as markdown links in text body |
| MCS strips URLs from markdown based on grounding | Less-known Wikipedia URLs removed from links | Use well-known URLs, or accept text-only source names |
| MCS rephrases questions | Keyword matching on MCP server must be robust | Use broad keyword sets, weight multi-word keywords higher |
| MCS bypasses MCP tool for some questions | Uses its own UniversalSearchTool instead | Add routing instructions; accept this can't be 100% controlled |
| Non-deterministic behavior | Same setup sometimes verbatim, sometimes not | Accept ~80-90% reliability; test multiple runs |
| Rate limiting | Errors on rapid sequential questions | Add delays between questions; use separate conversations |
| Tool description length limits | Overly detailed descriptions may be truncated | Keep tool description focused; put details in agent instructions |

---

## Recommended Architecture

For MCP servers that want to act as authoritative answer sources through Copilot Studio:

1. **Tool responses** should return complete, ready-to-display text with markdown citation links embedded in the body
2. **Tool description** should state the output is a "COMPLETE, FINAL response"
3. **Child agent instructions** must explicitly specify: askBookExpert output → SendMessageTool (unchanged)
4. **Don't rely on** `resource_link` blocks for user-facing citations
5. **Don't rely on** resources/subscribe for citation generation
6. **Accept** that MCS will sometimes rewrite despite instructions (~10-20% of the time)
7. **Accept** that MCS will strip URLs it can't verify through its grounding layer — the text body passes through but links may become plain text
8. **True verbatim pass-through (including URLs) is not guaranteed** — MCS always applies a grounding/safety layer that can modify the final output
