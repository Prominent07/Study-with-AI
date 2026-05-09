/**
 * main.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Application entry point.
 * Imports global styles and mounts React to the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { serviceWorkerManager } from './core/offline/ServiceWorkerManager';
import { GlobalErrorBoundary } from './core/recovery/GlobalErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Register PWA Service Worker for offline capabilities
serviceWorkerManager.register();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
