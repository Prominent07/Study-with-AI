/**
 * core/sync/types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types for the local-first Sync Engine architecture.
 */

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export type SyncEntity = 'note' | 'flashcard' | 'research' | 'settings';

export interface SyncOperation {
  id: string;
  entityType: SyncEntity;
  entityId: string;
  operationType: SyncOperationType;
  /** JSON serialized payload of the operation */
  payload: string;
  timestamp: number;
  /** Number of times sync was attempted and failed */
  retryCount: number;
}

export interface SyncEngineConfig {
  /** Debounce delay before background syncing starts (ms) */
  autoSyncDelayMs: number;
  /** Maximum number of retries per operation */
  maxRetries: number;
}
