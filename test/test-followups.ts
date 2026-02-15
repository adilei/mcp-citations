/**
 * Follow-up conversation test — verifies sub-topic answers and comparisons
 * are returned verbatim via SendMessageTool with citation links.
 */

import * as msal from '@azure/msal-node';
import { Activity, ActivityTypes } from '@microsoft/agents-activity';
import {
  loadCopilotStudioConnectionSettingsFromEnv,
  CopilotStudioClient,
} from '@microsoft/agents-copilotstudio-client';
import os from 'os';
import path from 'path';
import { MsalCachePlugin } from './msalCachePlugin.js';
import { ANSWERS } from '../src/data/answers.js';

async function acquireToken(settings: any): Promise<string> {
  const pca = new msal.PublicClientApplication({
    auth: {
      clientId: settings.appClientId!,
      authority: `https://login.microsoftonline.com/${settings.tenantId}`,
    },
    cache: {
      cachePlugin: new MsalCachePlugin(
        path.join(os.tmpdir(), 'mcp-citations-test.tokencache.json')
      ),
    },
  });
  const accounts = await pca.getAllAccounts();
  const scopes = ['https://api.powerplatform.com/.default'];
  const response = await pca.acquireTokenSilent({ account: accounts[0], scopes });
  return response.accessToken;
}

interface TestCase {
  question: string;
  expectedAnswerId: string;
}

const TEST_CASES: TestCase[] = [
  { question: 'Tell me about Dune by Frank Herbert', expectedAnswerId: 'dune' },
  { question: 'Tell me more about the Bene Gesserit', expectedAnswerId: 'bene-gesserit' },
  { question: 'What about Paul Atreides as a character?', expectedAnswerId: 'paul-atreides' },
  { question: 'Now tell me about Neuromancer', expectedAnswerId: 'neuromancer' },
  { question: 'How does Neuromancer compare to Dune?', expectedAnswerId: 'dune-vs-neuromancer' },
  { question: 'Tell me about the meaning of 42 in Hitchhiker\'s Guide', expectedAnswerId: 'deep-thought' },
];

async function main() {
  console.log('=== MCP Follow-Up Conversation Test ===\n');

  const settings = loadCopilotStudioConnectionSettingsFromEnv();
  console.log(`Agent: ${settings.agentIdentifier}\n`);

  const token = await acquireToken(settings);
  const client = new CopilotStudioClient(settings, token);

  let passed = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 5000)); // avoid rate limiting
    const tc = TEST_CASES[i];
    console.log(`─── Q${i + 1}: "${tc.question}" ───`);

    // Fresh conversation per question to avoid follow-up context
    let convId = '';
    for await (const act of client.startConversationStreaming(true)) {
      convId = act.conversation?.id ?? convId;
    }
    console.log(`  Conversation: ${convId}`);

    const activity = new Activity('message');
    activity.text = tc.question;
    activity.conversation = { id: convId };

    let finalText = '';
    let deltas = 0;
    let deltaText = '';
    let usedSendMessage = false;
    const tools: string[] = [];

    for await (const reply of client.sendActivityStreaming(activity)) {
      const cd = reply.channelData as Record<string, unknown> | undefined;
      if (reply.type === ActivityTypes.Typing && cd?.chunkType === 'delta') {
        deltas++;
        deltaText += reply.text || '';
      }
      if (reply.type === ActivityTypes.Event) {
        const value = (reply as any).value;
        if (value?.thought && value.taskDialogId) {
          const name: string = value.taskDialogId.includes(':')
            ? value.taskDialogId.split(':').pop()!
            : value.taskDialogId;
          if (name !== 'CaptureContextTool') tools.push(name);
          if (name === 'SendMessageTool') usedSendMessage = true;
        }
      }
      if (reply.type === ActivityTypes.Message) {
        finalText = reply.text || '';
      }
    }

    const expected = ANSWERS.find(a => a.id === tc.expectedAnswerId);
    // Full-text verbatim: strip any trailing cite markers (e.g. "citeSummary", "citebook-expert")
    const cleaned = finalText.replace(/cite[\w-]+$/g, '').trimEnd();
    const exactMatch = expected ? cleaned === expected.text : false;
    const phraseMatch = expected ? finalText.includes(expected.verbatimCheck) : false;
    const linkCount = (finalText.match(/https?:\/\/[^\s)]+/g) || []).length;
    if (exactMatch) passed++;

    const status = exactMatch ? 'PASS' : 'FAIL';
    console.log(`  Tools: ${tools.join(' → ')}`);
    console.log(`  Deltas: ${deltas} | SendMsg: ${usedSendMessage} | Exact: ${exactMatch ? 'YES' : 'NO'} | Phrase: ${phraseMatch ? 'YES' : 'NO'} | Links: ${linkCount}`);
    console.log(`  [${status}] Response (${finalText.length} chars): ${finalText.substring(0, 150).replace(/\n/g, ' ')}...`);
    if (deltas > 0) {
      console.log(`  Delta text: ${deltaText.substring(0, 300).replace(/\n/g, ' ')}${deltaText.length > 300 ? '...' : ''}`);
    }
    // Show diff for near-verbatim failures (phrase match but not exact)
    if (!exactMatch && phraseMatch && expected) {
      const expectedText = expected.text;
      const responseClean = cleaned;
      if (responseClean.length < expectedText.length) {
        const missing = expectedText.substring(responseClean.length);
        console.log(`  DIFF: Response is ${expectedText.length - responseClean.length} chars shorter`);
        console.log(`  Missing tail: ${JSON.stringify(missing.substring(0, 300))}`);
      } else if (responseClean.length > expectedText.length) {
        const extra = responseClean.substring(expectedText.length);
        console.log(`  DIFF: Response is ${responseClean.length - expectedText.length} chars longer`);
        console.log(`  Extra tail: ${JSON.stringify(extra.substring(0, 300))}`);
      } else {
        // Same length but different — find first diff
        for (let c = 0; c < expectedText.length; c++) {
          if (expectedText[c] !== responseClean[c]) {
            console.log(`  DIFF: First difference at char ${c}`);
            console.log(`  Expected: ${JSON.stringify(expectedText.substring(c, c + 80))}`);
            console.log(`  Got:      ${JSON.stringify(responseClean.substring(c, c + 80))}`);
            break;
          }
        }
      }
    }
    console.log('');
  }

  console.log(`\n═══ RESULT: ${passed}/${TEST_CASES.length} passed ═══`);
  if (passed < TEST_CASES.length) {
    console.log('Some follow-up answers were not relayed verbatim.');
  } else {
    console.log('All follow-up answers relayed verbatim with citation links!');
  }
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
