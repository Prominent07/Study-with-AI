/**
 * services/ai/ai.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The unified AI service — the single point of contact between the UI and all
 * AI provider implementations.
 *
 * Architecture:
 *   useAIStore.sendMessage()
 *       ↓
 *   AIService.stream()          ← THIS FILE
 *       ↓
 *   OpenAIProvider.streamChat()
 *   AnthropicProvider.streamChat()
 *   GeminiProvider.streamChat()
 *
 * Adding a new provider (e.g., local LLM via Ollama):
 *   1. Create src/services/ai/providers/ollama.provider.ts
 *   2. Extend BaseAIProvider
 *   3. Register it in PROVIDER_REGISTRY below
 *   4. Add the type to AIProvider in types/index.ts
 *
 * AbortController pattern:
 *   const controller = new AbortController();
 *   aiService.stream({ ..., signal: controller.signal });
 *   // Cancel: controller.abort();
 */

import type { AIProvider, ChatMessage, AIContext } from '@/types';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';
import type { BaseAIProvider, StreamOptions, ChatOptions } from './providers/base.provider';

// ── Provider Registry ─────────────────────────────────────────────────────────
// Add new providers here — no other file needs to change.
const PROVIDER_REGISTRY: Record<AIProvider, BaseAIProvider> = {
  gpt:    new OpenAIProvider(),
  claude: new AnthropicProvider(),
  gemini: new GeminiProvider(),
};

// ── AI Service ────────────────────────────────────────────────────────────────
class AIService {
  /** Get a provider instance by ID */
  getProvider(id: AIProvider): BaseAIProvider {
    const provider = PROVIDER_REGISTRY[id];
    if (!provider) throw new Error(`Unknown AI provider: ${id}`);
    return provider;
  }

  /** Check if a provider is configured (has API key) */
  isConfigured(id: AIProvider): boolean {
    return this.getProvider(id).isConfigured;
  }

  /**
   * Non-streaming chat. Returns the full response.
   * Use for background tasks (e.g., generating flashcards as a background job).
   */
  async ask(
    provider: AIProvider,
    messages: ChatMessage[],
    options?: Omit<ChatOptions, 'messages'>
  ): Promise<string> {
    return this.getProvider(provider).chat({ messages, ...options });
  }

  /**
   * Streaming chat — streams tokens to onChunk as they arrive.
   * This is the primary method for conversational messages.
   *
   * @returns An abort function — call it to cancel the stream.
   */
  stream(
    provider: AIProvider,
    messages: ChatMessage[],
    context: AIContext | undefined,
    callbacks: Pick<StreamOptions, 'onChunk' | 'onComplete' | 'onError'>,
    signal?: AbortSignal
  ): void {
    this.getProvider(provider).streamChat({
      messages,
      context,
      signal,
      onChunk: callbacks.onChunk,
      onComplete: callbacks.onComplete,
      onError: callbacks.onError,
    });
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// Use this throughout the app — no need to instantiate.
export const aiService = new AIService();
