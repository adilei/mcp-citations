# MCP Citations Pass-Through Test Harness

Test harness for evaluating whether Microsoft Copilot Studio (MCS) can act as a **verbatim pass-through** for an MCP server that has its own LLM. The MCP server is the trusted authority — it generates complete, authoritative answers with citations. The question: will MCS relay them unchanged?

## TL;DR

Near-verbatim pass-through is achievable when using a **child agent** architecture with explicit `SendMessageTool` instructions, but comes with significant caveats. MCS's grounding layer strips URLs it can't verify, the orchestrator model choice matters (GPT-4.1 is most reliable), and behavior is non-deterministic (~80-90% reliability).

**Using the main agent directly, verbatim pass-through is not currently possible.**

See **[FINDINGS.md](FINDINGS.md)** for the full analysis including all pitfalls, mitigations, and model comparison results.

## What's in this repo

### MCP Server (`src/`)

An Express-based MCP server simulating an LLM-powered sci-fi/fantasy book expert. Returns pre-written natural-language answers with markdown citation links to Wikipedia.

- Single tool: `askBookExpert` — takes a question, returns a complete answer
- 12 answer topics: Dune, Neuromancer, Lord of the Rings, Hitchhiker's Guide, Foundation, 1980s sci-fi, plus sub-topics (Bene Gesserit, Paul Atreides, Case, Elvish languages, Deep Thought) and a Dune vs Neuromancer comparison
- Each answer includes a `verbatimCheck` phrase for automated verification

### Test Scripts (`test/`)

- **`test-citations.ts`** — Sends 4 questions in separate conversations, checks exact full-text match and citation link preservation
- **`test-followups.ts`** — Sends 6 questions (including sub-topics and comparisons) in separate conversations, reports exact match, phrase match, diffs, and delta streaming analysis

Both use `@microsoft/agents-copilotstudio-client` + MSAL interactive auth to talk to MCS.

## Setup

### 1. MCP Server

```bash
npm install
npm run build
npm start          # Server on :3000
```

### 2. DevTunnel

```bash
devtunnel host -p 3000 --allow-anonymous
# MCP endpoint: https://<tunnel-id>.devtunnels.ms/mcp
```

### 3. Copilot Studio Agent

Configure an MCS agent with:
- The MCP server URL as an MCP action
- A **child agent** that calls the MCP tool
- Child agent instructions (see [FINDINGS.md](FINDINGS.md#1-near-verbatim-pass-through-is-achievable-but-with-caveats) for the exact instructions)

### 4. Environment

Create `.env` with your agent connection settings (camelCase names required by the SDK):

```
environmentId=...
agentIdentifier=...
tenantId=...
appClientId=...
```

### 5. Run Tests

```bash
npm run test                    # Main verbatim test (4 questions)
npm run build && node --env-file .env build/test/test-followups.js  # Follow-up test (6 questions)
```

## Key Findings

1. **Near-verbatim pass-through requires a child agent** — the main agent always rewrites
2. **`SendMessageTool` is the critical path** — child agent must use it to bypass parent summarization
3. **MCS strips URLs** from markdown links based on a grounding/safety layer
4. **MCP `resource_link` blocks don't generate user-facing citations** — embed links in text instead
5. **MCS rephrases questions** before calling MCP tools
6. **GPT-4.1 is the most reliable orchestrator model** for instruction-following
7. **Behavior is non-deterministic** — same question can be verbatim or rewritten across runs

Full details, model comparison table, and all mitigations: **[FINDINGS.md](FINDINGS.md)**
