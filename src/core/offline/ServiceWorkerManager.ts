/**
 * core/offline/ServiceWorkerManager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the PWA Service Worker lifecycle and offline status detection.
 */

import { systemEvents } from '../events/EventBus';

class ServiceWorkerManager {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public register(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[ServiceWorkerManager] SW registered with scope:', registration.scope);
            
            // Check for updates periodically (e.g., every hour)
            setInterval(() => {
              registration.update();
            }, 1000 * 60 * 60);
          })
          .catch((error) => {
            console.error('[ServiceWorkerManager] SW registration failed:', error);
          });
      });
    }
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    console.log('[ServiceWorkerManager] App is online');
    // We could emit a custom event here using the EventBus if we add it to EventPayloadMap later
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    console.log('[ServiceWorkerManager] App is offline');
  };

  public getIsOnline(): boolean {
    return this.isOnline;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
