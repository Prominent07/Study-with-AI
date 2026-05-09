/**
 * services/ai/providers/gemini.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Gemini provider implementation.
 *
 * Uses the Generative Language API (REST) with streaming via generateContentStream.
 * Gemini uses a different format: contents[] with parts[], role is "user"/"model".
 *
 * To enable: set VITE_GEMINI_API_KEY in your .env file
 *
 * Future: Use @google/generative-ai SDK for better type safety.
 */

import { BaseAIProvider, type ChatOptions, type StreamOptions } from './base.provider';
import { AI_CONFIG } from '@/config/ai.config';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider extends BaseAIProvider {
  readonly id = 'gemini';
  readonly name = 'Gemini';

  get isConfigured(): boolean {
    return AI_CONFIG.gemini.isConfigured;
  }

  async chat(options: ChatOptions): Promise<string> {
    const { messages, context, maxTokens, temperature, signal } = options;

    if (!this.isConfigured) return this.mockResponse('Gemini');

    const { contents, systemInstruction } = this.buildGeminiMessages(messages, context);
    const model = AI_CONFIG.gemini.model;

    const response = await fetch(
      `${GEMINI_BASE}/${model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
            temperature: temperature ?? AI_CONFIG.defaults.temperature,
          },
        }),
        signal,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Gemini error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text ?? '';
  }

  async streamChat(options: StreamOptions): Promise<void> {
    const { messages, context, maxTokens, temperature, signal, onChunk, onComplete, onError } = options;

    if (!this.isConfigured) {
      const mock = await this.mockResponse('Gemini');
      for (const char of mock) {
        onChunk(char);
        await new Promise((r) => setTimeout(r, 8));
      }
      onComplete(mock);
      return;
    }

    try {
      const { contents, systemInstruction } = this.buildGeminiMessages(messages, context);
      const model = AI_CONFIG.gemini.model;

      const response = await fetch(
        `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${AI_CONFIG.gemini.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              maxOutputTokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
              temperature: temperature ?? AI_CONFIG.defaults.temperature,
            },
          }),
          signal,
        }
      );

      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6));
            const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (token) { fullText += token; onChunk(token); }
          } catch { /* skip */ }
        }
      }

      onComplete(fullText);
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /** Converts internal messages to Gemini's contents format */
  private buildGeminiMessages(messages: ReturnType<typeof this.buildMessages>, context: ChatOptions['context']) {
    const systemInstruction = this.buildSystemPrompt(context);
    // Gemini uses "model" not "assistant"
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    return { contents, systemInstruction };
  }

  private async mockResponse(providerName: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 700));
    return `**${providerName} (Demo Mode)**\n\nYour API key is not configured. Add \`VITE_GEMINI_API_KEY\` to your \`.env\` file to enable real responses.\n\nThis is a placeholder response — the provider architecture is fully wired up.`;
  }
}
