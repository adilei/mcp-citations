/**
 * Test script for MCP citations pass-through via Copilot Studio.
 *
 * Uses @microsoft/agents-copilotstudio-client + MSAL interactive auth
 * to send questions to a Copilot Studio agent that has the book-expert
 * MCP server configured. Verifies:
 *   1. Verbatim pass-through of tool responses (fingerprint phrases)
 *   2. Citation markers in response text (Unicode cite markers)
 *   3. Citation entities with Wikipedia URLs
 *   4. Search result events with source URLs
 */

import * as msal from '@azure/msal-node';
import { Activity, ActivityTypes } from '@microsoft/agents-activity';
import {
  ConnectionSettings,
  loadCopilotStudioConnectionSettingsFromEnv,
  CopilotStudioClient,
} from '@microsoft/agents-copilotstudio-client';
import open from 'open';
import os from 'os';
import path from 'path';
import { MsalCachePlugin } from './msalCachePlugin.js';
import { ANSWERS, FALLBACK_ANSWER } from '../src/data/answers.js';
import type { Answer } from '../src/data/answers.js';

// ─── Auth ────────────────────────────────────────────────────────────────────

async function acquireToken(settings: ConnectionSettings): Promise<string> {
  const msalConfig = {
    auth: {
      clientId: settings.appClientId!,
      authority: `https://login.microsoftonline.com/${settings.tenantId}`,
    },
    cache: {
      cachePlugin: new MsalCachePlugin(
        path.join(os.tmpdir(), 'mcp-citations-test.tokencache.json')
      ),
    },
    system: {
      loggerOptions: {
        loggerCallback(_loglevel: msal.LogLevel, _message: string, _containsPii: boolean) {
          // silent
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Warning,
      },
    },
  };

  const pca = new msal.PublicClientApplication(msalConfig);
  const scopes = ['https://api.powerplatform.com/.default'];

  try {
    const accounts = await pca.getAllAccounts();
    if (accounts.length > 0) {
      const response = await pca.acquireTokenSilent({ account: accounts[0], scopes });
      return response.accessToken;
    }
  } catch {
    // fall through to interactive
  }

  const response = await pca.acquireTokenInteractive({
    scopes,
    openBrowser: async (url: string) => { await open(url); },
  });
  return response.accessToken;
}

// ─── Activity collection ─────────────────────────────────────────────────────

interface CollectedActivities {
  deltas: Activity[];       // typing + chunkType=delta
  informative: Activity[];  // typing + streamType=informative
  events: Activity[];       // event activities (thoughts, search results)
  finals: Activity[];       // message + streamType=final
  others: Activity[];       // anything else
}

function categorize(act: Activity): keyof CollectedActivities {
  const cd = act.channelData as Record<string, unknown> | undefined;

  if (act.type === ActivityTypes.Typing) {
    if (cd?.chunkType === 'delta') return 'deltas';
    if (cd?.streamType === 'informative') return 'informative';
    return 'others';
  }
  if (act.type === ActivityTypes.Message) {
    if (cd?.streamType === 'final') return 'finals';
    return 'finals'; // treat all messages as finals
  }
  if (act.type === ActivityTypes.Event) return 'events';
  return 'others';
}

function collectActivities(): CollectedActivities {
  return { deltas: [], informative: [], events: [], finals: [], others: [] };
}

// ─── Analysis ────────────────────────────────────────────────────────────────

const CITE_PATTERN = /\ue200cite\ue202(.+?)\ue201/g;

interface TestResult {
  question: string;
  expectedAnswer: Answer;
  responseText: string;
  verbatimMatch: boolean;
  citationMarkers: string[];
  citationEntities: Array<{ type: string; id: string; name: string; url: string }>;
  searchResultUrls: string[];
  activityCounts: Record<string, number>;
  pass: boolean;
}

function analyzeResults(
  question: string,
  expectedAnswer: Answer,
  collected: CollectedActivities
): TestResult {
  // Get the final message text
  const finalMsg = collected.finals[0];
  const responseText = finalMsg?.text ?? '';

  // Full-text verbatim check: strip trailing cite markers and compare exact text
  const cleaned = responseText.replace(/cite[\w-]+$/g, '').trimEnd();
  const verbatimMatch = cleaned === expectedAnswer.text;

  // Extract citation markers from text — both Unicode format and raw "cite<name>" format
  const citationMarkers: string[] = [];
  // Unicode format: \ue200cite\ue202{id}\ue201
  const unicodeRegex = new RegExp(CITE_PATTERN.source, 'g');
  let match;
  while ((match = unicodeRegex.exec(responseText)) !== null) {
    citationMarkers.push(match[1]);
  }
  // Raw format: "cite" followed by a name (e.g., "citebook-expert")
  const rawCiteRegex = /cite([a-z][\w-]*)/g;
  while ((match = rawCiteRegex.exec(responseText)) !== null) {
    citationMarkers.push(match[1]);
  }

  // Extract citation entities from final message
  const citationEntities: TestResult['citationEntities'] = [];
  const entities = (finalMsg as any)?.entities as any[] | undefined;
  if (entities) {
    for (const entity of entities) {
      if (entity.type === 'https://schema.org/Claim') {
        citationEntities.push({
          type: entity.type,
          id: entity['@id'] ?? entity.id ?? '',
          name: entity.name ?? '',
          url: entity.url ?? '',
        });
      }
    }
  }

  // Extract search result URLs from event activities
  const searchResultUrls: string[] = [];
  for (const evt of collected.events) {
    const value = (evt as any).value;
    const results = value?.observation?.search_result?.search_results;
    if (Array.isArray(results)) {
      for (const sr of results) {
        if (sr.Url) searchResultUrls.push(sr.Url);
      }
    }
  }

  const activityCounts = {
    deltas: collected.deltas.length,
    informative: collected.informative.length,
    events: collected.events.length,
    finals: collected.finals.length,
    others: collected.others.length,
  };

  // Pass criteria: verbatim check phrase found
  const pass = verbatimMatch;

  return {
    question,
    expectedAnswer,
    responseText,
    verbatimMatch,
    citationMarkers,
    citationEntities,
    searchResultUrls,
    activityCounts,
    pass,
  };
}

// ─── Test cases ──────────────────────────────────────────────────────────────

interface TestCase {
  question: string;
  expectedAnswerId: string;
}

const TEST_CASES: TestCase[] = [
  {
    question: "Tell me about Dune by Frank Herbert",
    expectedAnswerId: "dune",
  },
  {
    question: "What cyberpunk novels do you know about?",
    expectedAnswerId: "neuromancer",
  },
  {
    question: "Who wrote The Lord of the Rings?",
    expectedAnswerId: "lotr",
  },
  {
    question: "Tell me interesting facts about The Hitchhiker's Guide to the Galaxy",
    expectedAnswerId: "hitchhikers",
  },
];

function findExpectedAnswer(id: string): Answer {
  return ANSWERS.find(a => a.id === id) ?? FALLBACK_ANSWER;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== MCP Citations Pass-Through Test ===\n');

  // Load settings and authenticate
  const settings = loadCopilotStudioConnectionSettingsFromEnv();
  console.log(`Agent: ${settings.agentIdentifier}`);
  console.log(`Environment: ${settings.environmentId}`);
  console.log(`Tenant: ${settings.tenantId}\n`);

  console.log('Acquiring token...');
  const token = await acquireToken(settings);
  console.log('Token acquired.\n');

  const client = new CopilotStudioClient(settings, token);

  // Start conversation
  console.log('Starting conversation...');
  let conversationId = '';
  for await (const act of client.startConversationStreaming(true)) {
    if (act.conversation?.id) {
      conversationId = act.conversation.id;
    }
  }
  console.log(`Conversation started: ${conversationId}\n`);

  const results: TestResult[] = [];

  for (const tc of TEST_CASES) {
    console.log(`─── Test: "${tc.question}" ───`);

    const activity = new Activity('message');
    activity.text = tc.question;
    activity.conversation = { id: conversationId };

    const collected = collectActivities();

    for await (const reply of client.sendActivityStreaming(activity)) {
      const bucket = categorize(reply);
      collected[bucket].push(reply);

      // Live progress
      const cd = reply.channelData as Record<string, unknown> | undefined;
      if (reply.type === ActivityTypes.Typing && cd?.streamType === 'informative') {
        console.log(`  [info] ${reply.text}`);
      } else if (reply.type === ActivityTypes.Event) {
        const value = (reply as any).value;
        if (value?.thought) {
          const taskId = value.taskDialogId ?? '';
          const taskName = taskId.includes(':') ? taskId.split(':').pop() : taskId;
          console.log(`  [thought] ${taskName}: ${value.thought.substring(0, 80)}...`);
        }
        if (value?.observation?.search_result) {
          const urls = value.observation.search_result.search_results?.map((r: any) => r.Url) ?? [];
          console.log(`  [search] ${urls.length} results: ${urls.join(', ')}`);
        }
      }
    }

    const expected = findExpectedAnswer(tc.expectedAnswerId);
    const result = analyzeResults(tc.question, expected, collected);
    results.push(result);

    // Print summary for this test
    console.log(`  Response length: ${result.responseText.length} chars`);
    console.log(`  Verbatim: ${result.verbatimMatch ? 'YES' : 'NO'}`);
    console.log(`  Citation markers: ${result.citationMarkers.length > 0 ? result.citationMarkers.join(', ') : 'none'}`);
    console.log(`  Citation entities: ${result.citationEntities.length > 0 ? result.citationEntities.map(e => e.url || e.name).join(', ') : 'none'}`);
    console.log(`  Search result URLs: ${result.searchResultUrls.length > 0 ? result.searchResultUrls.join(', ') : 'none'}`);
    console.log(`  Activities: ${JSON.stringify(result.activityCounts)}`);
    console.log(`  Result: ${result.pass ? 'PASS' : 'FAIL'}\n`);
  }

  // ─── Final report ──────────────────────────────────────────────────────────
  console.log('\n═══ FINAL REPORT ═══\n');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.pass).length}`);
  console.log(`Failed: ${results.filter(r => !r.pass).length}`);

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    const vb = r.verbatimMatch ? 'VB:yes' : 'VB:no';
    const cite = `cite:${r.citationMarkers.length}`;
    const ent = `ent:${r.citationEntities.length}`;
    const search = `search:${r.searchResultUrls.length}`;
    console.log(`│ [${status}] ${r.question.substring(0, 40).padEnd(40)} ${vb} ${cite} ${ent} ${search}`);
  }
  console.log('└─────────────────────────────────────────────────────────────────┘');

  // Print detailed response text for failed tests
  const failed = results.filter(r => !r.pass);
  if (failed.length > 0) {
    console.log('\n─── Failed test details ───\n');
    for (const r of failed) {
      console.log(`Question: ${r.question}`);
      console.log(`Expected phrase: "${r.expectedAnswer.verbatimCheck}"`);
      console.log(`Response (first 500 chars):\n${r.responseText.substring(0, 500)}\n`);
    }
  }

  // Print full response for all tests (for manual inspection)
  console.log('\n─── Full responses ───\n');
  for (const r of results) {
    console.log(`Q: ${r.question}`);
    console.log(`A: ${r.responseText}\n`);
    if (r.citationEntities.length > 0) {
      console.log(`  Entities:`);
      for (const e of r.citationEntities) {
        console.log(`    - [${e.id}] ${e.name}: ${e.url}`);
      }
      console.log('');
    }
  }
}

main().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
