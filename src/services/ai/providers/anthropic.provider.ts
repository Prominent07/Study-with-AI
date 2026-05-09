/**
 * services/ai/providers/anthropic.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Anthropic (Claude) provider implementation.
 *
 * Uses the Messages API with streaming support.
 * Note: Anthropic requires a different message format — system is a top-level
 * field, not a message in the array.
 *
 * To enable: set VITE_ANTHROPIC_API_KEY in your .env file
 *
 * IMPORTANT: In production, Anthropic requires server-side calls due to CORS.
 * For now, this works via a local proxy or direct browser fetch.
 * Future: route through a Cloudflare Worker / Vercel Edge Function.
 */

import { BaseAIProvider, type ChatOptions, type StreamOptions } from './base.provider';
import { AI_CONFIG } from '@/config/ai.config';

export class AnthropicProvider extends BaseAIProvider {
  readonly id = 'claude';
  readonly name = 'Claude';

  get isConfigured(): boolean {
    return AI_CONFIG.anthropic.isConfigured;
  }

  async chat(options: ChatOptions): Promise<string> {
    const { messages, context, maxTokens, temperature, signal } = options;

    if (!this.isConfigured) return this.mockResponse('Claude');

    // Anthropic: system is top-level, messages array contains only user/assistant
    const systemPrompt = this.buildSystemPrompt(context);
    const anthropicMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await fetch(`${AI_CONFIG.anthropic.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: AI_CONFIG.anthropic.model,
        system: systemPrompt,
        messages: anthropicMessages,
        max_tokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
        temperature: temperature ?? AI_CONFIG.defaults.temperature,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Anthropic error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text ?? '';
  }

  async streamChat(options: StreamOptions): Promise<void> {
    const { messages, context, maxTokens, temperature, signal, onChunk, onComplete, onError } = options;

    if (!this.isConfigured) {
      const mock = await this.mockResponse('Claude');
      for (const char of mock) {
        onChunk(char);
        await new Promise((r) => setTimeout(r, 8));
      }
      onComplete(mock);
      return;
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const anthropicMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const response = await fetch(`${AI_CONFIG.anthropic.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_CONFIG.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: AI_CONFIG.anthropic.model,
          system: systemPrompt,
          messages: anthropicMessages,
          max_tokens: maxTokens ?? AI_CONFIG.defaults.maxTokens,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);

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
            if (parsed.type === 'content_block_delta') {
              const token = parsed.delta?.text ?? '';
              if (token) { fullText += token; onChunk(token); }
            }
            if (parsed.type === 'message_stop') { onComplete(fullText); return; }
          } catch { /* skip malformed lines */ }
        }
      }

      onComplete(fullText);
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async mockResponse(providerName: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 900));
    return `**${providerName} (Demo Mode)**\n\nYour API key is not configured. Add \`VITE_ANTHROPIC_API_KEY\` to your \`.env\` file to enable real responses.\n\nThis is a placeholder response — the provider architecture is fully wired up.`;
  }
}
