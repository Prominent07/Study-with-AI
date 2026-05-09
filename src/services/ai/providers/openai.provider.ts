/**
 * services/ai/providers/openai.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenAI (GPT) provider implementation.
 *
 * Non-streaming: Uses /chat/completions with stream: false
 * Streaming: Uses /chat/completions with stream: true, reads SSE chunks
 *
 * To enable: set VITE_OPENAI_API_KEY in your .env file
 *
 * Future extensions:
 *   - Function calling for structured outputs (flashcard generation)
 *   - Embeddings via /embeddings for RAG
 *   - Vision via gpt-4o with image_url in messages
 */

import { BaseAIProvider, type ChatOptions, type StreamOptions } from './base.provider';
import { AI_CONFIG } from '@/config/ai.config';

export class OpenAIProvider extends BaseAIProvider {
  readonly id = 'gpt';
  readonly name = 'GPT-4o';

  get isConfigured(): boolean {
    return AI_CONFIG.openai.isConfigured;
  }

  async chat(options: ChatOptions): Promise<string> {
    const { messages, context, maxTokens, temperature, signal } = options;

    if (!this.isConfigured) {
      return this.mockResponse('GPT-4o');
    }

    const response = await fetch(`${AI_CONFIG.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: this.buildMessages(messages, context),
        max_tokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
        temperature: temperature ?? AI_CONFIG.defaults.temperature,
        stream: false,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
  }

  async streamChat(options: StreamOptions): Promise<void> {
    const { messages, context, maxTokens, temperature, signal, onChunk, onComplete, onError } = options;

    if (!this.isConfigured) {
      const mock = await this.mockResponse('GPT-4o');
      // Simulate streaming for mock
      for (const char of mock) {
        onChunk(char);
        await new Promise((r) => setTimeout(r, 8));
      }
      onComplete(mock);
      return;
    }

    try {
      const response = await fetch(`${AI_CONFIG.openai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.openai.model,
          messages: this.buildMessages(messages, context),
          max_tokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
          temperature: temperature ?? AI_CONFIG.defaults.temperature,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6); // remove "data: "
          if (data === '[DONE]') { onComplete(fullText); return; }
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices[0]?.delta?.content ?? '';
            if (token) { fullText += token; onChunk(token); }
          } catch { /* skip malformed SSE lines */ }
        }
      }

      onComplete(fullText);
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async mockResponse(providerName: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 800));
    return `**${providerName} (Demo Mode)**\n\nYour API key is not configured. Add \`VITE_OPENAI_API_KEY\` to your \`.env\` file to enable real responses.\n\nThis is a placeholder response showing the architecture is working correctly.`;
  }
}
