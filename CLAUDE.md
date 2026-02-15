# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

mcp-citations — MCP server simulating an LLM-powered sci-fi/fantasy book expert with citations, for testing Copilot Studio pass-through behavior.

## Commands

- `npm run build` — TypeScript build (src/ + test/ → build/)
- `npm start` — Run MCP server on :3000
- `npm run dev` — Build + start
- `npm run test` — Build + run test script (loads .env, needs MSAL interactive auth)
- `devtunnel host -p 3000 --allow-anonymous` — Expose server via dev tunnel for CS

## Architecture

- **src/index.ts** — Express server with `POST /mcp` (stateless StreamableHTTPServerTransport). Single tool `askBookExpert` + ListResources/ReadResource handlers.
- **src/data/answers.ts** — 6 pre-written answers with fingerprint phrases and Wikipedia citation URLs. Keyword matching selects answers.
- **test/test-citations.ts** — Sends questions to a Copilot Studio agent via M365 Agents SDK. Checks verbatim pass-through (fingerprint phrases) and citation preservation (Unicode markers, entities, search result events).

## Testing with Copilot Studio

1. Start server + devtunnel
2. Configure the MCP URL in Copilot Studio agent (Guild tenant, agent1)
3. Run `npm run test` — authenticates via MSAL interactive browser, talks to agent, verifies responses

## .env format (camelCase for SDK's `loadCopilotStudioConnectionSettingsFromEnv`)

```
environmentId=...
agentIdentifier=...
tenantId=...
appClientId=...
```

## Important Notes

- The SDK function `loadCopilotStudioConnectionSettingsFromEnv()` reads camelCase env vars: `appClientId`, `tenantId`, `environmentId`, `agentIdentifier` (not SCREAMING_SNAKE_CASE).
- MCP server uses stateless pattern: new `StreamableHTTPServerTransport` per request with `sessionIdGenerator: undefined` and `enableJsonResponse: true`.
- Each answer has a fingerprint phrase (e.g. "According to the Galactic Literary Registry...") that uniquely identifies it — used to verify CS relays verbatim vs. rewrites.
- `resource_link` blocks in tool responses generate citations in CS. ReadResource returns the same text as the tool response so even if CS reads the resource, the content matches.
