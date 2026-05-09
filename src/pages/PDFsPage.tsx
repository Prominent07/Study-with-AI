/**
 * pages/PDFsPage.tsx
 * PDF library page. Shows uploaded PDFs and allows uploading new ones.
 */

import React from 'react';
import { PdfList } from '@/features/pdf/PdfList';

const PDFsPage: React.FC = () => {
  return (
    <div className="h-full bg-workspace-bg flex justify-center p-8">
      <div className="w-full max-w-3xl h-[80%] rounded-2xl border border-workspace-border overflow-hidden shadow-sm">
        <PdfList />
      </div>
    </div>
  );
};

export default PDFsPage;
