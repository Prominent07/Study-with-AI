/**
 * core/memory/MemoryService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * AI Memory Foundation.
 * Manages persistent context that gets injected into every AI conversation.
 * 
 * Future Implementation: Connects to a vector database for semantic retrieval
 * of past conversations.
 */

import type { AIMemorySnapshot, MemoryPipelineContext } from './types';
import { useRevisionStore } from '@/store/useRevisionStore';

class MemoryService {
  private currentMemory: AIMemorySnapshot = {
    userPreferences: {
      verbosity: 'concise',
      role: 'academic tutor',
    },
    studyPatterns: {
      preferredStudyTime: 'evening',
      averageSessionLengthMs: 0,
    },
    weakTopics: [],
    recentContext: [],
  };

  /**
   * Refreshes the memory snapshot by pulling the latest data from the app state.
   */
  public updateSnapshot(): void {
    // Pull weak topics from the revision store to dynamically inform the AI
    const weakTopics = useRevisionStore.getState().getWeakTopics().map(t => t.tag);
    
    this.currentMemory = {
      ...this.currentMemory,
      weakTopics,
    };
  }

  /**
   * Builds the final pipeline context to be injected into an AI prompt.
   * This is called right before sending a request to the LLM.
   */
  public buildPipelineContext(activeNoteTitle?: string, activeNoteContent?: string): MemoryPipelineContext {
    this.updateSnapshot();
    
    return {
      activeNoteTitle,
      activeNoteContent,
      systemMemory: this.currentMemory,
    };
  }

  /**
   * Generates a system prompt string that incorporates the current memory snapshot.
   */
  public generateSystemPrompt(): string {
    this.updateSnapshot();
    const prefs = this.currentMemory.userPreferences;
    const weakTopicsStr = this.currentMemory.weakTopics.length > 0 
      ? `The user is currently struggling with: ${this.currentMemory.weakTopics.join(', ')}. Keep this in mind and provide extra guidance on these topics.` 
      : '';

    return `You are a ${prefs.role}. Please be ${prefs.verbosity} in your responses.
    
    ${weakTopicsStr}
    
    Your goal is to help the user learn effectively and build connections between their notes.`;
  }
}

export const memoryService = new MemoryService();
