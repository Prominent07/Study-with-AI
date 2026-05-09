/**
 * pages/SettingsPage.tsx
 * Application settings — future: theme, AI keys, sync, etc.
 */

import React from 'react';
import { Settings, Key, Moon, Bell, Database, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, badge }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-workspace-hover transition-colors duration-200 cursor-pointer group">
    <div className="w-9 h-9 rounded-lg bg-workspace-raised border border-workspace-border flex items-center justify-center text-ink-muted group-hover:text-ink-secondary flex-shrink-0 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-ink-secondary group-hover:text-ink-primary transition-colors">
          {title}
        </p>
        {badge && <Badge label={badge} color="#a78bfa" />}
      </div>
      <p className="text-xs text-ink-muted mt-0.5">{description}</p>
    </div>
    <span className="text-ink-faint text-sm">›</span>
  </div>
);

const SettingsPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-workspace-bg">
      <div className="h-[52px] flex items-center px-6 border-b border-workspace-border bg-workspace-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-accent-light" />
          <span className="text-sm font-semibold text-ink-primary">Settings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl font-bold text-ink-primary mb-1">Settings</h1>
          <p className="text-sm text-ink-muted mb-6">Configure your StudyAI workspace</p>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-4 mb-2">
              AI Providers
            </p>
            <SettingRow
              icon={<Key size={18} />}
              title="API Keys"
              description="Connect OpenAI, Anthropic, and Google AI"
              badge="Required"
            />

            <div className="divider" />
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-4 mb-2 mt-4">
              Appearance
            </p>
            <SettingRow
              icon={<Moon size={18} />}
              title="Theme"
              description="Dark mode (default) · Light mode · System"
            />

            <div className="divider" />
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-4 mb-2 mt-4">
              Data & Sync
            </p>
            <SettingRow
              icon={<Database size={18} />}
              title="Storage"
              description="Local storage · Cloud sync (coming soon)"
              badge="Beta"
            />
            <SettingRow
              icon={<Bell size={18} />}
              title="Notifications"
              description="Study reminders and spaced repetition alerts"
            />
            <SettingRow
              icon={<Shield size={18} />}
              title="Privacy"
              description="Data handling, analytics, and permissions"
            />
          </div>

          <div className="mt-8 p-4 rounded-lg border border-workspace-border bg-workspace-raised text-center">
            <p className="text-xs text-ink-muted">StudyAI v0.1.0 · Foundation Build</p>
            <p className="text-xs text-ink-faint mt-1">© 2025 StudyAI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
