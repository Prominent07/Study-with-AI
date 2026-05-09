/**
 * core/export/ExportManager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles serialization and downloading of workspace data.
 */

import { useNoteStore } from '@/store/useNoteStore';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { useResearchStore } from '@/store/useResearchStore';

class ExportManager {
  /**
   * Triggers a browser download of a JSON Blob.
   */
  private downloadBlob(filename: string, content: string, type: string = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Emergency export: Dumps all primary Zustand store states into a single JSON file.
   */
  public exportWorkspaceJSON(): void {
    try {
      const notes = useNoteStore.getState().notes;
      const flashcards = useFlashcardStore.getState().cards;
      const research = useResearchStore.getState().items;

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          notes,
          flashcards,
          research
        }
      };

      this.downloadBlob(`StudyAI_Backup_${Date.now()}.json`, JSON.stringify(backup, null, 2));
    } catch (e) {
      console.error('[ExportManager] Failed to export workspace JSON:', e);
      alert('Export failed. Please check the console.');
    }
  }

  /**
   * Exports a single note as Markdown.
   * Note: This is a basic text extraction. Future versions would parse Tiptap JSON to MD properly.
   */
  public exportNoteMarkdown(noteId: string): void {
    try {
      const note = useNoteStore.getState().notes.find(n => n.id === noteId);
      if (!note) throw new Error('Note not found');

      // Basic extraction using the excerpt as a fallback until a full Tiptap -> MD parser is added
      const title = note.title || 'Untitled';
      const textContent = note.excerpt || ''; 
      
      const md = `# ${title}\n\n*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n${textContent}`;

      this.downloadBlob(`${title.replace(/[^a-z0-9]/gi, '_')}.md`, md, 'text/markdown');
    } catch (e) {
      console.error('[ExportManager] Failed to export Note MD:', e);
    }
  }
}

export const exportManager = new ExportManager();
