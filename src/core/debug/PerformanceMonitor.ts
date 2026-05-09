/**
 * core/debug/PerformanceMonitor.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Extremely lightweight performance monitor. Measures Time-To-Interactive and
 * checks if background tasks are blocking the main thread.
 */

class PerformanceMonitor {
  private startupTime: number = 0;
  private tti: number = 0;

  constructor() {
    if (typeof performance !== 'undefined') {
      this.startupTime = performance.now();
      
      // Rough estimation of TTI
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.tti = performance.now();
          console.log(`[PerformanceMonitor] Time-To-Interactive: ${this.tti.toFixed(2)}ms`);
        }, 0);
      });
    }
  }

  public measureTask(taskName: string, task: () => void): void {
    const start = performance.now();
    task();
    const end = performance.now();
    const duration = end - start;

    if (duration > 50) {
      console.warn(`[PerformanceMonitor] Task "${taskName}" took ${duration.toFixed(2)}ms, which is blocking the main thread.`);
    }
  }

  public getStats() {
    return {
      timeToInteractive: this.tti,
      memory: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1048576 : null, // MB
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
