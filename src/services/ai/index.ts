/**
 * services/ai/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * AI service stub — will be replaced with real SDK calls in a future phase.
 *
 * Architecture:
 * - Each provider (OpenAI, Anthropic, Google) gets its own file here.
 * - This index exports a unified `sendAIMessage` function that routes to the
 *   correct provider based on the active selection.
 * - Streaming will be implemented using the provider SDKs' streaming APIs.
 *
 * To add a provider:
 *   1. Create services/ai/openai.ts (or claude.ts / gemini.ts)
 *   2. Export a `streamChat(messages, options)` function
 *   3. Import and wire it up in this index
 */

import type { AIProvider, ChatMessage } from '@/types';

export interface SendMessageOptions {
  provider: AIProvider;
  messages: ChatMessage[];
  apiKey?: string;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
}

/**
 * sendAIMessage — Stub implementation.
 * Replace each provider's case with the real SDK call.
 */
export async function sendAIMessage(options: SendMessageOptions): Promise<string> {
  const { provider, messages } = options;

  // TODO: Replace with real API calls
  // import { streamOpenAI } from './openai';
  // import { streamClaude } from './claude';
  // import { streamGemini } from './gemini';

  const lastMessage = messages[messages.length - 1]?.content ?? '';
  console.log(`[${provider.toUpperCase()}] Sending: "${lastMessage.slice(0, 50)}..."`);

  // Simulated async delay
  await new Promise((r) => setTimeout(r, 1000));
  return `Stub response from ${provider}. Connect your API key to enable real responses.`;
}
