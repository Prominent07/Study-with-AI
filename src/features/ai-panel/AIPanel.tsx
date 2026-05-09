/**
 * features/ai-panel/AIPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Right AI panel — premium, tablet-optimised AI chat interface.
 *
 * Layout:
 *   [Header: title + clear button]
 *   [Provider switcher tabs]
 *   [API key nudge — only if provider not configured]
 *   ─────────────────────────────────────
 *   [Chat area — scrollable, auto-scroll to bottom]
 *   ─────────────────────────────────────
 *   [Quick action chips]
 *   [Input area + send/stop button]
 *
 * Streaming UX:
 *   - Assistant bubble appears immediately with blinking cursor
 *   - Tokens append in-place (no layout shift)
 *   - Stop button replaces Send while streaming
 *   - Auto-scrolls on every token
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Send, Sparkles, BookOpen, HelpCircle, Zap, Trash2,
  Bot, User, MessageSquare, Square, Key, Copy, Check,
  FileText, BrainCircuit,
} from 'lucide-react';

import { useAIStore, AI_PROVIDERS } from '@/store/useAIStore';
import { useNoteStore } from '@/store/useNoteStore';
import { isProviderConfigured } from '@/config/ai.config';
import { Button } from '@/components/ui/Button';
import type { AIProvider, ChatMessage, AIQuickAction } from '@/types';

// ── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS: AIQuickAction[] = [
  {
    id: 'summarize',
    label: 'Summarize Note',
    icon: 'sparkles',
    prompt: 'Summarize the current note in 3-5 key bullet points. Be concise.',
    category: 'study',
  },
  {
    id: 'analyze-pdf',
    label: 'Analyze PDF',
    icon: 'file',
    prompt: 'Please analyze the currently open PDF and provide a comprehensive overview of its main arguments and findings.',
    category: 'study',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: 'book',
    prompt: 'Explain the key concepts in this note in simple, easy-to-understand terms.',
    category: 'study',
  },
  {
    id: 'simplify',
    label: 'Simplify',
    icon: 'brain',
    prompt: 'Rewrite the main ideas from this note in simpler language, like explaining to a beginner.',
    category: 'study',
  },
  {
    id: 'quiz',
    label: 'Quiz Me',
    icon: 'help',
    prompt: 'Generate 5 quiz questions based on the content of this note. Include answers.',
    category: 'study',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: 'zap',
    prompt: 'Create 5 flashcard Q&A pairs from the key concepts in this note. Format as:\nQ: ...\nA: ...',
    category: 'study',
  },
];

// ── Provider Colors ───────────────────────────────────────────────────────────
const PROVIDER_COLORS: Record<AIProvider, string> = {
  gpt:    '#10a37f',
  claude: '#d4a96a',
  gemini: '#4285f4',
};

// ── Action Icons ──────────────────────────────────────────────────────────────
const ActionIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const map: Record<string, React.ReactNode> = {
    sparkles: <Sparkles size={11} />,
    book:     <BookOpen size={11} />,
    brain:    <BrainCircuit size={11} />,
    help:     <HelpCircle size={11} />,
    zap:      <Zap size={11} />,
    file:     <FileText size={11} />,
  };
  return <>{map[icon] ?? <Sparkles size={11} />}</>;
};

// ── Copy Button ───────────────────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-faint hover:text-ink-secondary"
      aria-label="Copy message"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
};

// ── Markdown Renderer (lightweight, no library) ───────────────────────────────
// Simple regex-based rendering. Replace with react-markdown in a future phase
// when full GFM support is needed.
const SimpleMarkdown: React.FC<{ content: string; isStreaming?: boolean }> = ({
  content, isStreaming,
}) => {
  const lines = content.split('\n');

  const renderLine = (line: string, i: number) => {
    // Code block handled at block level below
    if (line.startsWith('# '))  return <h1 key={i} className="text-base font-bold text-ink-primary mt-2 mb-1">{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-semibold text-ink-primary mt-2 mb-0.5">{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-semibold text-ink-secondary mt-1.5 mb-0.5">{line.slice(4)}</h3>;
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <li key={i} className="ml-3 list-disc list-outside text-ink-secondary">{renderInline(line.slice(2))}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={i} className="ml-3 list-decimal list-outside text-ink-secondary">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>;
    }
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      return <p key={i} className="font-semibold text-ink-primary">{line.slice(2, -2)}</p>;
    }
    if (line === '') return <br key={i} />;
    return <p key={i} className="text-ink-secondary leading-relaxed">{renderInline(line)}</p>;
  };

  const renderInline = (text: string) => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-ink-primary">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-workspace-bg text-accent-light px-1 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Handle code blocks
  const blocks: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let blockIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        blocks.push(
          <pre key={`code-${blockIdx++}`} className="bg-workspace-bg border border-workspace-border rounded-lg px-3 py-2 my-2 overflow-x-auto font-mono text-[11px] text-accent-light leading-relaxed">
            {codeLines.join('\n')}
          </pre>
        );
        inCode = false;
      }
    } else if (inCode) {
      codeLines.push(lines[i]);
    } else {
      blocks.push(renderLine(lines[i], blockIdx++));
    }
  }

  return (
    <div className="text-xs space-y-0.5">
      {blocks}
      {isStreaming && (
        <span className="inline-block w-0.5 h-3.5 bg-accent-light animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
};

// ── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-in group`}>
      {/* Avatar */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? 'bg-accent/20 text-accent-light'
            : 'bg-workspace-raised border border-workspace-border text-ink-muted'
        }`}
      >
        {isUser ? <User size={12} /> : <Bot size={12} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[88%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-xl px-3 py-2 ${
            isUser
              ? 'bg-accent/12 border border-accent/20 text-ink-primary'
              : 'bg-workspace-raised border border-workspace-border'
          }`}
        >
          {isUser ? (
            <p className="text-xs text-ink-primary leading-relaxed">{message.content}</p>
          ) : (
            <SimpleMarkdown content={message.content} isStreaming={message.isStreaming} />
          )}
        </div>

        {/* Copy button — only on complete assistant messages */}
        {!isUser && !message.isStreaming && message.content && (
          <CopyButton text={message.content} />
        )}
      </div>
    </div>
  );
};

// ── Empty Chat State ──────────────────────────────────────────────────────────
const EmptyChatState: React.FC<{ provider: AIProvider }> = ({ provider }) => {
  const config = AI_PROVIDERS.find((p) => p.id === provider)!;
  const activeNote = useNoteStore.getState().getActiveNote();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4 fade-in">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center border"
        style={{
          backgroundColor: `${PROVIDER_COLORS[provider]}15`,
          borderColor: `${PROVIDER_COLORS[provider]}30`,
        }}
      >
        <MessageSquare size={20} style={{ color: PROVIDER_COLORS[provider] }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-secondary">{config.label} ready</p>
        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{config.description}</p>
      </div>
      {activeNote && (
        <div className="text-[11px] text-ink-faint bg-workspace-raised border border-workspace-border rounded-lg px-3 py-2 w-full text-left">
          <p className="font-medium text-ink-muted mb-0.5">Note context loaded:</p>
          <p className="truncate">{activeNote.title || 'Untitled Note'}</p>
          <p className="text-ink-faint">{activeNote.wordCount} words</p>
        </div>
      )}
      <p className="text-[11px] text-ink-faint">Use quick actions or type a message</p>
    </div>
  );
};

// ── API Key Nudge ─────────────────────────────────────────────────────────────
const ApiKeyNudge: React.FC<{ provider: AIProvider }> = ({ provider }) => {
  const envKey = { gpt: 'VITE_OPENAI_API_KEY', claude: 'VITE_ANTHROPIC_API_KEY', gemini: 'VITE_GEMINI_API_KEY' }[provider];
  return (
    <div className="mx-3 mb-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg flex items-start gap-2 flex-shrink-0">
      <Key size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] text-amber-400 font-medium">API key not configured</p>
        <p className="text-[10px] text-ink-muted mt-0.5">
          Add <code className="text-amber-400/80">{envKey}</code> to your <code className="text-amber-400/80">.env</code> file to use real AI. Demo mode active.
        </p>
      </div>
    </div>
  );
};

// ── Main AI Panel ─────────────────────────────────────────────────────────────
export const AIPanel: React.FC = () => {
  const {
    provider, setProvider,
    messages, inputDraft, setInputDraft,
    isLoading, clearMessages, sendMessage, abortStream,
  } = useAIStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const configured = isProviderConfigured(provider);

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    setInputDraft(el.value);
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSend = () => {
    if (inputDraft.trim() && !isLoading) {
      sendMessage(inputDraft);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: AIQuickAction) => {
    if (!isLoading) sendMessage(action.prompt, action.id);
  };

  return (
    <aside
      className="panel h-full flex-shrink-0 w-[320px] border-l border-workspace-border flex flex-col"
      aria-label="AI Assistant"
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-workspace-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles size={13} className="text-accent-light" />
            </div>
            <span className="text-sm font-semibold text-ink-primary">AI Assistant</span>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="!w-7 !h-7 text-ink-muted hover:text-red-400"
              aria-label="Clear conversation"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>

        {/* Provider Switcher */}
        <div className="flex gap-1 p-1 rounded-lg bg-workspace-bg border border-workspace-border">
          {AI_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              aria-pressed={provider === p.id}
              className={[
                'flex-1 py-1.5 px-1.5 rounded-md text-[11px] font-medium transition-all duration-200',
                provider === p.id
                  ? 'bg-workspace-raised text-ink-primary shadow-sm'
                  : 'text-ink-muted hover:text-ink-secondary',
              ].join(' ')}
              style={provider === p.id ? { color: PROVIDER_COLORS[p.id] } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* API key nudge */}
      {!configured && <ApiKeyNudge provider={provider} />}

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <EmptyChatState provider={provider} />
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-3 py-2 border-t border-workspace-border flex-shrink-0">
        <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="chip disabled:opacity-40 disabled:cursor-not-allowed text-[11px] py-1 px-2"
            >
              <ActionIcon icon={action.icon} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="px-3 pb-4 pt-2 flex-shrink-0">
        <div className="flex gap-2 items-end bg-workspace-raised border border-workspace-border rounded-xl p-2 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-colors duration-200">
          <textarea
            ref={textareaRef}
            value={inputDraft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${AI_PROVIDERS.find((p) => p.id === provider)?.label ?? 'AI'} anything…`}
            rows={1}
            disabled={false}
            aria-label="AI prompt input"
            className="flex-1 bg-transparent text-xs text-ink-primary placeholder:text-ink-muted resize-none outline-none leading-relaxed"
            style={{ minHeight: '24px', maxHeight: '120px' }}
          />

          {/* Send / Stop button */}
          {isLoading ? (
            <button
              onClick={abortStream}
              className="w-7 h-7 flex-shrink-0 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              aria-label="Stop generation"
            >
              <Square size={11} />
            </button>
          ) : (
            <Button
              variant="primary"
              size="icon"
              onClick={handleSend}
              disabled={!inputDraft.trim()}
              className="!w-7 !h-7 flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={12} />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-ink-faint mt-1.5 text-center">
          {isLoading ? 'Generating… click ■ to stop' : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </aside>
  );
};
