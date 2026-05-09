/**
 * core/workspace/SnapshotManager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture for saving and restoring Workspace Snapshots.
 * Enables features like "Study Sessions" or "Workspace Templates".
 */

import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useTabStore } from '@/store/useTabStore';
import { usePdfStore } from '@/store/usePdfStore';

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  timestamp: number;
  state: {
    activeNav: string;
    isSplitMode: boolean;
    leftPaneContent: string | null;
    activeNoteId: string | null;
    openTabs: Array<{ noteId: string; title: string }>;
    activePdfId: string | null;
  };
}

class SnapshotManager {
  private snapshots: Map<string, WorkspaceSnapshot> = new Map();

  /**
   * Captures the current state of the workspace and saves it as a snapshot.
   */
  public createSnapshot(name: string): WorkspaceSnapshot {
    const workspaceState = useWorkspaceStore.getState();
    const tabState = useTabStore.getState();
    const pdfState = usePdfStore.getState();

    const snapshot: WorkspaceSnapshot = {
      id: `snap-${Date.now()}`,
      name,
      timestamp: Date.now(),
      state: {
        activeNav: workspaceState.activeNav,
        isSplitMode: workspaceState.isSplitMode,
        leftPaneContent: workspaceState.leftPaneContent,
        activeNoteId: workspaceState.activeNoteId,
        openTabs: [...tabState.tabs],
        activePdfId: pdfState.activePdfId,
      },
    };

    this.snapshots.set(snapshot.id, snapshot);
    
    // Future Implementation: Persist to indexedDB or cloud
    // localStorage.setItem('studyai-snapshots', JSON.stringify(Array.from(this.snapshots.entries())));

    return snapshot;
  }

  /**
   * Restores the workspace to a previously saved snapshot.
   */
  public restoreSnapshot(snapshotId: string): void {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} not found.`);

    const workspaceStore = useWorkspaceStore.getState();
    const tabStore = useTabStore.getState();
    const pdfStore = usePdfStore.getState();

    // Batch UI updates
    workspaceStore.setActiveNav(snapshot.state.activeNav as any);
    workspaceStore.setSplitMode(snapshot.state.isSplitMode);
    workspaceStore.setLeftPaneContent(snapshot.state.leftPaneContent as any);
    workspaceStore.setActiveNoteId(snapshot.state.activeNoteId);
    
    tabStore.closeAllTabs();
    snapshot.state.openTabs.forEach(tab => tabStore.openTab(tab.noteId, tab.title));

    if (snapshot.state.activePdfId) {
      pdfStore.setActivePdf(snapshot.state.activePdfId);
    }
  }

  public getSnapshots(): WorkspaceSnapshot[] {
    return Array.from(this.snapshots.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const snapshotManager = new SnapshotManager();
