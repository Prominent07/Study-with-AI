/**
 * store/usePdfStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages uploaded PDFs for the research workspace.
 * 
 * Note on persistence: Blob URLs cannot be stored in localStorage.
 * In a future phase, this will use IndexedDB to store the actual file binaries.
 * For now, this is a transient store — PDFs need to be re-uploaded on reload.
 */

import { create } from 'zustand';
import type { PdfDocument } from '@/types';

interface PdfStore {
  pdfs: PdfDocument[];
  activePdfId: string | null;

  // Actions
  uploadPdf: (file: File) => Promise<string>;
  removePdf: (id: string) => void;
  clearAllPdfs: () => void;
  setActivePdf: (id: string | null) => void;
}

export const usePdfStore = create<PdfStore>((set) => ({
  pdfs: [],
  activePdfId: null,

  uploadPdf: async (file: File) => {
    // Create a local blob URL for the iframe viewer
    const url = URL.createObjectURL(file);
    const newPdf: PdfDocument = {
      id: `pdf-${Date.now()}`,
      name: file.name,
      size: file.size,
      url,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      pdfs: [newPdf, ...state.pdfs],
      activePdfId: newPdf.id, // Auto-open on upload
    }));

    return newPdf.id;
  },

  removePdf: (id: string) => {
    set((state) => {
      // Revoke blob URL to prevent memory leaks
      const pdf = state.pdfs.find((p) => p.id === id);
      if (pdf) URL.revokeObjectURL(pdf.url);

      return {
        pdfs: state.pdfs.filter((p) => p.id !== id),
        activePdfId: state.activePdfId === id ? null : state.activePdfId,
      };
    });
  },

  setActivePdf: (id: string | null) => set({ activePdfId: id }),

  clearAllPdfs: () => {
    set((state) => {
      state.pdfs.forEach(pdf => URL.revokeObjectURL(pdf.url));
      return { pdfs: [], activePdfId: null };
    });
  },
}));
