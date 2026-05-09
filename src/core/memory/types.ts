/**
 * core/memory/types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types for the Persistent AI Memory System.
 */

export interface AIMemorySnapshot {
  userPreferences: {
    verbosity: 'concise' | 'detailed';
    role: string; // e.g., 'academic tutor'
  };
  studyPatterns: {
    preferredStudyTime: string; // e.g., 'evening'
    averageSessionLengthMs: number;
  };
  weakTopics: string[]; // Aggregated from useRevisionStore
  recentContext: string[]; // Snippets of recently discussed concepts
}

export interface MemoryPipelineContext {
  activeNoteTitle?: string;
  activeNoteContent?: string;
  systemMemory: AIMemorySnapshot;
}
