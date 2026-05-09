/**
 * core/tasks/types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript definitions for the Background Task System.
 */

export type TaskPriority = 'high' | 'normal' | 'low';

export interface BackgroundTask {
  id: string;
  name: string;
  priority: TaskPriority;
  /** Function to execute. Should return a promise. */
  execute: () => Promise<void>;
  /** Optional callback when task completes successfully */
  onComplete?: () => void;
  /** Optional callback when task fails */
  onError?: (error: Error) => void;
}
