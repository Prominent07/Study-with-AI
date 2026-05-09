/**
 * core/sync/SyncEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Local-first Sync Architecture.
 * Tracks operations in a local queue and attempts background syncing.
 * This lays the foundation for future real-time collaboration or cloud sync.
 */

import type { SyncOperation, SyncEntity, SyncOperationType, SyncEngineConfig } from './types';
import { systemEvents } from '../events/EventBus';

class SyncEngine {
  private queue: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private config: SyncEngineConfig = {
    autoSyncDelayMs: 5000,
    maxRetries: 3,
  };
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Pushes a new operation to the sync queue.
   */
  public enqueue(
    entityType: SyncEntity,
    entityId: string,
    operationType: SyncOperationType,
    payload: any
  ): void {
    const operation: SyncOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      entityType,
      entityId,
      operationType,
      payload: JSON.stringify(payload),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    this.scheduleSync();
  }

  /**
   * Debounces the sync execution so rapid edits don't flood the network.
   */
  private scheduleSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(() => {
      this.processQueue();
    }, this.config.autoSyncDelayMs);
  }

  /**
   * Processes the operation queue.
   * Currently mocked, prepared for future backend integration.
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.queue.length === 0) return;
    
    this.isSyncing = true;
    systemEvents.emit('sync:started', undefined);

    const operationsToSync = [...this.queue];
    let syncedCount = 0;

    try {
      // Future Implementation:
      // const response = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(operationsToSync) });
      // if (!response.ok) throw new Error('Network response was not ok');

      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Successfully synced — remove from queue
      this.queue = this.queue.filter(op => !operationsToSync.find(s => s.id === op.id));
      syncedCount = operationsToSync.length;

      systemEvents.emit('sync:completed', { operationsSynced: syncedCount });
    } catch (error) {
      console.error('[SyncEngine] Sync failed:', error);
      
      // Increment retries and handle dead letters
      this.queue.forEach(op => {
        if (operationsToSync.find(s => s.id === op.id)) {
          op.retryCount++;
        }
      });

      // Remove operations that exceeded max retries to unblock the queue
      this.queue = this.queue.filter(op => op.retryCount < this.config.maxRetries);

      systemEvents.emit('sync:error', { error: error as Error });
    } finally {
      this.isSyncing = false;
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const syncEngine = new SyncEngine();
