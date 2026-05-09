/**
 * config/ai.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised AI configuration — reads from environment variables.
 *
 * All VITE_* variables are bundled at build time by Vite.
 * They are NOT secret — they end up in the browser bundle.
 * For production, use a backend proxy to protect API keys.
 *
 * Pattern:
 *   import { AI_CONFIG } from '@/config/ai.config';
 *   const key = AI_CONFIG.openai.apiKey;
 */

import type { AIProvider } from '@/types';

interface ProviderConfig {
  apiKey: string;
  /** Whether the provider is configured (has a non-empty key) */
  isConfigured: boolean;
}

interface AIConfigShape {
  openai: ProviderConfig & {
    model: string;
    baseUrl: string;
  };
  anthropic: ProviderConfig & {
    model: string;
    baseUrl: string;
  };
  gemini: ProviderConfig & {
    model: string;
  };
  defaults: {
    provider: AIProvider;
    maxTokens: number;
    temperature: number;
  };
}

export const AI_CONFIG: AIConfigShape = {
  openai: {
    apiKey:       import.meta.env.VITE_OPENAI_API_KEY ?? '',
    isConfigured: Boolean(import.meta.env.VITE_OPENAI_API_KEY),
    model:        'gpt-4o',
    baseUrl:      'https://api.openai.com/v1',
  },
  anthropic: {
    apiKey:       import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
    isConfigured: Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY),
    model:        'claude-3-5-sonnet-20241022',
    baseUrl:      'https://api.anthropic.com/v1',
  },
  gemini: {
    apiKey:       import.meta.env.VITE_GEMINI_API_KEY ?? '',
    isConfigured: Boolean(import.meta.env.VITE_GEMINI_API_KEY),
    model:        'gemini-1.5-flash',
  },
  defaults: {
    provider:    (import.meta.env.VITE_AI_DEFAULT_PROVIDER as AIProvider) ?? 'gpt',
    maxTokens:   Number(import.meta.env.VITE_AI_MAX_TOKENS) || 2048,
    temperature: Number(import.meta.env.VITE_AI_TEMPERATURE) || 0.7,
  },
};

/** Returns true if at least one provider has an API key configured */
export function hasAnyProviderConfigured(): boolean {
  return AI_CONFIG.openai.isConfigured ||
         AI_CONFIG.anthropic.isConfigured ||
         AI_CONFIG.gemini.isConfigured;
}

/** Returns true if the given provider has an API key */
export function isProviderConfigured(provider: AIProvider): boolean {
  const map: Record<AIProvider, boolean> = {
    gpt:    AI_CONFIG.openai.isConfigured,
    claude: AI_CONFIG.anthropic.isConfigured,
    gemini: AI_CONFIG.gemini.isConfigured,
  };
  return map[provider];
}
