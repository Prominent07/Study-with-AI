/**
 * store/useAIStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central AI state store — manages:
 *   - Active provider selection
 *   - Chat message history (persisted)
 *   - Streaming state + abort
 *   - Input draft
 *
 * Key design decisions:
 *
 * 1. STREAMING: Messages have isStreaming:true while receiving tokens.
 *    The streaming message is updated in-place (not appended repeatedly)
 *    to avoid React re-renders per token.
 *
 * 2. ABORT: Each send creates a new AbortController. The abort() action
 *    cancels the current stream mid-flight.
 *
 * 3. PERSISTENCE: Only messages + provider are persisted. isLoading,
 *    inputDraft, and abortController are transient (not saved).
 *
 * 4. CONTEXT: Context is injected at send time via getAIContext(),
 *    not stored — it always reflects the current note.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIProvider, ChatMessage, AIProviderConfig } from '@/types';
import { aiService } from '@/services/ai/ai.service';
import { getAIContext } from '@/features/ai/hooks/useAIContext';

// ── Provider Configurations ───────────────────────────────────────────────────
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gpt',
    label: 'GPT-4o',
    description: 'OpenAI • Most capable general model',
    color: '#10a37f',
    available: true,
  },
  {
    id: 'claude',
    label: 'Claude',
    description: 'Anthropic • Best for long documents',
    color: '#d4a96a',
    available: true,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Google • Multimodal, fast responses',
    color: '#4285f4',
    available: true,
  },
];

// ── ID Generator ──────────────────────────────────────────────────────────────
function msgId(role: string): string {
  return `msg-${Date.now()}-${role}-${Math.random().toString(36).slice(2, 5)}`;
}

// ── Store Interface ───────────────────────────────────────────────────────────
interface AIStore {
  provider: AIProvider;
  messages: ChatMessage[];
  inputDraft: string;
  isLoading: boolean;
  /** Internal — not exposed; used to cancel streams */
  _abortController: AbortController | null;

  // ── Selectors ────────────────────────────────────────────────────────────
  /** True if the selected provider has an API key configured */
  isProviderConfigured: () => boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  setProvider: (provider: AIProvider) => void;
  setInputDraft: (text: string) => void;
  clearMessages: () => void;

  /**
   * sendMessage — the primary action.
   * Adds user message → starts streaming AI response.
   * Safe to call concurrently (cancels any in-flight request first).
   */
  sendMessage: (content: string, actionId?: string) => void;

  /** Cancel the current streaming response */
  abortStream: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      provider: 'gpt',
      messages: [],
      inputDraft: '',
      isLoading: false,
      _abortController: null,

      isProviderConfigured: () => aiService.isConfigured(get().provider),

      setProvider: (provider) =>
        set({ provider }),  // Keep messages when switching (user may want to compare)

      setInputDraft: (text) => set({ inputDraft: text }),

      clearMessages: () => {
        get().abortStream();
        set({ messages: [], isLoading: false });
      },

      abortStream: () => {
        const { _abortController } = get();
        _abortController?.abort();
        set({
          isLoading: false,
          _abortController: null,
          // Mark any streaming message as complete
          messages: get().messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          ),
        });
      },

      sendMessage: (content: string, actionId?: string) => {
        const trimmed = content.trim();
        if (!trimmed || get().isLoading) return;

        // Cancel any in-flight request first
        get()._abortController?.abort();

        const controller = new AbortController();
        const { provider, messages } = get();

        // 1. Add user message
        const userMsg: ChatMessage = {
          id: msgId('user'),
          role: 'user',
          content: trimmed,
          timestamp: new Date().toISOString(),
          actionId,
        };

        // 2. Add a placeholder streaming message for the assistant
        const assistantMsgId = msgId('assistant');
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          provider,
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        set({
          messages: [...messages, userMsg, assistantMsg],
          inputDraft: '',
          isLoading: true,
          _abortController: controller,
        });

        // 3. Inject note context
        const context = getAIContext();

        // 4. Stream from provider
        const allMessages = [...messages, userMsg];

        aiService.stream(
          provider,
          allMessages,
          context,
          {
            onChunk: (chunk) => {
              // Update the streaming message content in-place
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + chunk }
                    : m
                ),
              }));
            },
            onComplete: (fullText) => {
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: fullText, isStreaming: false }
                    : m
                ),
                isLoading: false,
                _abortController: null,
              }));
            },
            onError: (error) => {
              console.error('[AIStore] Stream error:', error);
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `⚠️ Error: ${error.message}`,
                        isStreaming: false,
                      }
                    : m
                ),
                isLoading: false,
                _abortController: null,
              }));
            },
          },
          controller.signal
        );
      },
    }),
    {
      name: 'studyai-ai',
      storage: createJSONStorage(() => localStorage),
      // Don't persist transient state
      partialize: (s) => ({
        provider: s.provider,
        messages: s.messages
          .filter((m) => !m.isStreaming)    // Never persist partial streams
          .slice(-100),                       // Keep last 100 messages
      }),
    }
  )
);
