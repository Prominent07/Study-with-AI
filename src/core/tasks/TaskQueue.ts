/**
 * core/tasks/TaskQueue.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * A priority-based queue for non-blocking operations.
 * Uses requestIdleCallback (where available) to avoid blocking the main UI thread.
 */

import type { BackgroundTask } from './types';

class TaskQueue {
  private queue: BackgroundTask[] = [];
  private isProcessing: boolean = false;

  /**
   * Add a task to the queue. Tasks are sorted by priority automatically.
   */
  public enqueue(task: BackgroundTask): void {
    this.queue.push(task);
    this.sortQueue();
    this.scheduleProcessing();
  }

  private sortQueue(): void {
    const priorityWeights = { high: 3, normal: 2, low: 1 };
    this.queue.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
  }

  private scheduleProcessing(): void {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // Use requestIdleCallback if supported (browsers), fallback to setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => this.processNext());
    } else {
      setTimeout(() => this.processNext(), 0);
    }
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    try {
      await task.execute();
      task.onComplete?.();
    } catch (error) {
      console.error(`[TaskQueue] Task ${task.name} failed:`, error);
      task.onError?.(error as Error);
    }

    // Schedule next tick
    this.isProcessing = false;
    this.scheduleProcessing();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const backgroundTasks = new TaskQueue();
