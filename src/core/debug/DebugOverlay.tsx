/**
 * core/debug/DebugOverlay.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hidden UI panel for diagnosing memory usage and sync queue length.
 * Toggle via Ctrl+Shift+D
 */

import React, { useEffect, useState } from 'react';
import { perfMonitor } from './PerformanceMonitor';
import { syncEngine } from '../sync/SyncEngine';
import { backgroundTasks } from '../tasks/TaskQueue';

export const DebugOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ mem: 0, tti: 0, syncQueue: 0, taskQueue: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const perfStats = perfMonitor.getStats();
      setStats({
        mem: perfStats.memory ? Math.round(perfStats.memory) : 0,
        tti: Math.round(perfStats.timeToInteractive),
        syncQueue: syncEngine.getQueueLength(),
        taskQueue: backgroundTasks.getQueueLength()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md text-green-400 font-mono text-[10px] p-3 rounded-lg border border-green-500/30 z-[9999] shadow-2xl pointer-events-none">
      <div className="font-bold border-b border-green-500/30 pb-1 mb-2 text-green-300">StudyAI Debug</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span>Memory (Heap):</span> <span className="text-right">{stats.mem ? `${stats.mem} MB` : 'N/A'}</span>
        <span>TTI:</span> <span className="text-right">{stats.tti} ms</span>
        <span>Sync Queue:</span> <span className="text-right">{stats.syncQueue} ops</span>
        <span>Task Queue:</span> <span className="text-right">{stats.taskQueue} ops</span>
      </div>
    </div>
  );
};
