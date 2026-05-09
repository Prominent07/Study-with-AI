/**
 * pages/ResearchPage.tsx
 * Research workspace — shows all saved snippets and bookmarks.
 */

import React from 'react';
import { ResearchPanel } from '@/features/research/ResearchPanel';

const ResearchPage: React.FC = () => {
  return (
    <div className="h-full bg-workspace-bg flex justify-center p-8">
      <div className="w-full max-w-3xl h-[80%] rounded-2xl border border-workspace-border overflow-hidden shadow-sm">
        <ResearchPanel />
      </div>
    </div>
  );
};

export default ResearchPage;
