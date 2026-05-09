/**
 * router/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React Router v6 configuration.
 * WorkspaceLayout wraps all routes as the root layout shell.
 *
 * Adding a new page = add one <Route> here + the page component in src/pages/.
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';

// ── Code-split pages for better initial load on low-RAM devices ───────────────
const NotesPage      = lazy(() => import('@/pages/NotesPage'));
const ResearchPage   = lazy(() => import('@/pages/ResearchPage'));
const PDFsPage       = lazy(() => import('@/pages/PDFsPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const CanvasPage     = lazy(() => import('@/pages/CanvasPage'));
const SettingsPage   = lazy(() => import('@/pages/SettingsPage'));

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex gap-1">
      <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ── Router Definition ─────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    element: <WorkspaceLayout />,
    children: [
      // Redirect root → notes
      { index: true, element: <Navigate to="/notes" replace /> },
      { path: 'notes',      element: withSuspense(NotesPage)      },
      { path: 'research',   element: withSuspense(ResearchPage)   },
      { path: 'pdfs',       element: withSuspense(PDFsPage)       },
      { path: 'flashcards', element: withSuspense(FlashcardsPage) },
      { path: 'canvas',     element: withSuspense(CanvasPage)     },
      { path: 'settings',   element: withSuspense(SettingsPage)   },
    ],
  },
]);
