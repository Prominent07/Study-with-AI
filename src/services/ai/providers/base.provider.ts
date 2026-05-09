/**
 * services/ai/providers/base.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Abstract base class for all AI providers.
 *
 * Every provider (OpenAI, Anthropic, Gemini, future local models) MUST
 * extend this class and implement `chat()` and `streamChat()`.
 *
 * This is the core of the provider abstraction pattern:
 *   - The AIService calls provider.chat() / provider.streamChat()
 *   - It never cares which provider is underneath
 *   - Swapping providers = swapping the class instance
 *
 * Future: extend with `embed()` for RAG, `vision()` for image analysis.
 */

import type { ChatMessage, AIContext } from '@/types';

export interface ChatOptions {
  messages: ChatMessage[];
  context?: AIContext;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface StreamOptions extends ChatOptions {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export abstract class BaseAIProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  /** Whether this provider has a valid API key configured */
  abstract get isConfigured(): boolean;

  /**
   * Non-streaming chat — returns the full response as a string.
   * Use for quick actions and short prompts.
   */
  abstract chat(options: ChatOptions): Promise<string>;

  /**
   * Streaming chat — fires onChunk for each token, onComplete when done.
   * Use for conversational messages where latency matters.
   */
  abstract streamChat(options: StreamOptions): Promise<void>;

  /**
   * Build the system prompt with context injection.
   * All providers call this to get a consistent, note-aware system prompt.
   */
  protected buildSystemPrompt(context?: AIContext): string {
    const lines = [
      'You are a highly intelligent AI academic assistant embedded in a note-taking workspace.',
      'You help students understand, summarize, and engage with their study material.',
      'Be concise, accurate, and friendly. Format responses with markdown when helpful.',
    ];

    if (context?.noteTitle) {
      lines.push(`\nCurrent note title: "${context.noteTitle}"`);
    }
    if (context?.noteContent) {
      const preview = context.noteContent.slice(0, 2000);
      lines.push(`\nCurrent note content:\n---\n${preview}${context.noteContent.length > 2000 ? '\n[content truncated]' : ''}\n---`);
    }
    if (context?.selectedText) {
      lines.push(`\nSelected text: "${context.selectedText}"`);
    }
    if (context?.wordCount) {
      lines.push(`\nNote word count: ${context.wordCount} words`);
    }

    return lines.join('\n');
  }

  /**
   * Convert internal ChatMessage[] to the format this provider expects.
   * Handles the system message injection.
   */
  protected buildMessages(messages: ChatMessage[], context?: AIContext) {
    const systemPrompt = this.buildSystemPrompt(context);
    return [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];
  }
}
