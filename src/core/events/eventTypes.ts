/**
 * core/events/eventTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Strict type definitions for the global Event Bus.
 */

export type EventType =
  | 'note:created'
  | 'note:updated'
  | 'note:deleted'
  | 'ai:message_generated'
  | 'flashcard:reviewed'
  | 'workspace:split_toggled'
  | 'sync:started'
  | 'sync:completed'
  | 'sync:error';

export interface BaseEvent<T extends EventType, P = any> {
  type: T;
  payload: P;
  timestamp: number;
}

export interface NoteUpdatedPayload {
  noteId: string;
  source: 'user' | 'sync' | 'ai';
}

export interface AIResponsePayload {
  conversationId: string;
  messageId: string;
  tokens: number;
}

export interface SyncErrorPayload {
  error: Error;
  operationId?: string;
}

// Map event types to their specific payload shapes
export interface EventPayloadMap {
  'note:created': { noteId: string };
  'note:updated': NoteUpdatedPayload;
  'note:deleted': { noteId: string };
  'ai:message_generated': AIResponsePayload;
  'flashcard:reviewed': { cardId: string; difficulty: number };
  'workspace:split_toggled': { isSplit: boolean };
  'sync:started': void;
  'sync:completed': { operationsSynced: number };
  'sync:error': SyncErrorPayload;
}
