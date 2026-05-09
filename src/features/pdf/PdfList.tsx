/**
 * features/pdf/PdfList.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UI to list uploaded PDFs and handle new uploads.
 */

import React, { useRef } from 'react';
import { FileArchive, Upload, Trash2 } from 'lucide-react';
import { usePdfStore } from '@/store/usePdfStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/Button';

export const PdfList: React.FC = () => {
  const { pdfs, activePdfId, uploadPdf, setActivePdf, removePdf } = usePdfStore();
  const { setSplitMode, setLeftPaneContent } = useWorkspaceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadPdf(file);
    
    // Automatically open in split mode
    setSplitMode(true);
    setLeftPaneContent('pdf');
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenPdf = (id: string) => {
    setActivePdf(id);
    setSplitMode(true);
    setLeftPaneContent('pdf');
  };

  return (
    <div className="flex flex-col h-full bg-workspace-bg">
      <div className="p-4 flex items-center justify-between border-b border-workspace-border">
        <h2 className="text-sm font-semibold text-ink-primary">Local PDFs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<Upload size={14} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {pdfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <FileArchive size={24} className="text-ink-faint" />
            <p className="text-xs text-ink-muted">No PDFs uploaded yet.<br/>Upload one to start annotating.</p>
          </div>
        ) : (
          pdfs.map((pdf) => (
            <div 
              key={pdf.id}
              onClick={() => handleOpenPdf(pdf.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                activePdfId === pdf.id 
                  ? 'bg-workspace-surface border border-workspace-border shadow-sm' 
                  : 'hover:bg-workspace-hover border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activePdfId === pdf.id ? 'bg-accent/10 text-accent-light' : 'bg-workspace-raised text-ink-muted'
                }`}>
                  <FileArchive size={14} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    activePdfId === pdf.id ? 'text-ink-primary' : 'text-ink-secondary'
                  }`}>
                    {pdf.name}
                  </p>
                  <p className="text-[10px] text-ink-faint">
                    {(pdf.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              
              <button 
                className="opacity-0 group-hover:opacity-100 p-1.5 text-ink-faint hover:text-red-400 hover:bg-workspace-raised rounded transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  removePdf(pdf.id);
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
