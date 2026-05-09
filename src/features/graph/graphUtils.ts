/**
 * features/graph/graphUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Lays the data structure foundation for a future 2D/3D knowledge graph view.
 * Converts the flat array of NoteDocuments into Nodes and Edges.
 */

import type { NoteDocument } from '@/types';

export interface GraphNode {
  id: string;
  label: string;
  group: string; // Used for coloring (e.g. by folder or tag)
  val: number; // Node size (based on word count or number of connections)
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function generateGraphData(notes: NoteDocument[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Used to quickly check if a target node actually exists before adding an edge
  const validNoteIds = new Set(notes.map((n) => n.id));

  notes.forEach((note) => {
    // 1. Create Node
    nodes.push({
      id: note.id,
      label: note.title || 'Untitled Note',
      group: note.folderId || 'uncategorized',
      val: Math.max(1, Math.min(10, note.wordCount / 100)), // Scale node size
    });

    // 2. Create Edges for all outgoing links
    if (note.linkedNoteIds) {
      note.linkedNoteIds.forEach((linkedId) => {
        if (validNoteIds.has(linkedId)) {
          edges.push({
            source: note.id,
            target: linkedId,
          });
        }
      });
    }
  });

  return { nodes, edges };
}
