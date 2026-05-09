/**
 * features/canvas/CanvasEditor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A wrapper around the Tldraw component to integrate it cleanly into the
 * Workspace layout. This component is lazy-loaded to prevent Tldraw from
 * bloating the main application bundle.
 */

import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

interface CanvasEditorProps {
  boardId: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ boardId }) => {
  return (
    <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
      {/* 
        Tldraw handles its own persistence via IndexedDB when a persistenceKey is provided.
        We pass the boardId so each board has its own isolated canvas state.
      */}
      <Tldraw persistenceKey={`studyai-canvas-${boardId}`} />
    </div>
  );
};

export default CanvasEditor;
