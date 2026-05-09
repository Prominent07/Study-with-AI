/**
 * core/recovery/GlobalErrorBoundary.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Catches any unhandled React exceptions anywhere in the app to prevent a white
 * screen of death. Renders a premium recovery UI with options to export data.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportManager } from '../export/ExportManager';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Uncaught Exception:', error, errorInfo);
    // Future: send error to logging service (Sentry, etc.)
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleEmergencyExport = () => {
    exportManager.exportWorkspaceJSON();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-workspace-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-ink-primary mb-2">Something went wrong</h1>
          <p className="text-ink-secondary max-w-md mb-8">
            The workspace encountered an unexpected error. Your data is still safe in local storage, but the UI crashed.
          </p>

          <div className="bg-workspace-surface border border-workspace-border rounded-xl p-4 w-full max-w-xl text-left mb-8 overflow-auto max-h-48">
            <code className="text-xs text-red-400 font-mono">
              {this.state.error?.toString()}
            </code>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={this.handleEmergencyExport}
              leftIcon={<Download size={16} />}
            >
              Emergency Backup (JSON)
            </Button>
            <Button 
              variant="primary" 
              onClick={this.handleReload}
              leftIcon={<RefreshCw size={16} />}
            >
              Reload Workspace
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
