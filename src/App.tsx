/**
 * App.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application component.
 * Provides the RouterProvider — all layout and routing is handled inside.
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';

import { DebugOverlay } from './core/debug/DebugOverlay';

const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <DebugOverlay />
    </>
  );
};

export default App;
