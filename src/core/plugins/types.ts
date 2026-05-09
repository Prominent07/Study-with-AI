/**
 * core/plugins/types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript interfaces for the Plugin System Foundation.
 */

import type { EventType, EventPayloadMap } from '../events/eventTypes';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

/**
 * The API exposed to plugins.
 * Acts as a sandbox to interact with the core application.
 */
export interface PluginAPI {
  // Event Subscriptions
  onEvent: <T extends EventType>(type: T, callback: (payload: EventPayloadMap[T]) => void) => () => void;
  emitEvent: <T extends EventType>(type: T, payload: EventPayloadMap[T]) => void;
  
  // Future capabilities will be added here:
  // registerCommand: (commandId: string, action: () => void) => void;
  // registerPanel: (panelId: string, component: React.FC) => void;
  // getState: () => AppStateSnapshot;
}

export interface StudyPlugin {
  manifest: PluginManifest;
  
  /** Called when the plugin is enabled */
  activate: (api: PluginAPI) => void;
  
  /** Called when the plugin is disabled or uninstalled */
  deactivate: () => void;
}
