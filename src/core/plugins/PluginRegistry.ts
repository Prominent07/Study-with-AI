/**
 * core/plugins/PluginRegistry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the lifecycle and execution sandbox of plugins.
 */

import type { StudyPlugin, PluginAPI } from './types';
import { systemEvents } from '../events/EventBus';
import type { EventType, EventPayloadMap } from '../events/eventTypes';

class PluginRegistry {
  private plugins: Map<string, StudyPlugin> = new Map();
  private activePlugins: Set<string> = new Set();

  /**
   * Generates a safe API wrapper for each plugin, ensuring they can't 
   * arbitrarily manipulate the entire application state without permission.
   */
  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      onEvent: <T extends EventType>(type: T, callback: (payload: EventPayloadMap[T]) => void) => {
        // Here we could add permission checks (e.g. does plugin X have permission to listen to Y?)
        return systemEvents.subscribe(type, (e) => callback(e.payload));
      },
      emitEvent: <T extends EventType>(type: T, payload: EventPayloadMap[T]) => {
        systemEvents.emit(type, payload);
      },
    };
  }

  public register(plugin: StudyPlugin): void {
    if (this.plugins.has(plugin.manifest.id)) {
      console.warn(`Plugin ${plugin.manifest.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.manifest.id, plugin);
  }

  public activate(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found.`);
    if (this.activePlugins.has(pluginId)) return;

    try {
      const api = this.createPluginAPI(pluginId);
      plugin.activate(api);
      this.activePlugins.add(pluginId);
      console.log(`Plugin ${pluginId} activated successfully.`);
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
    }
  }

  public deactivate(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    if (!this.activePlugins.has(pluginId)) return;

    try {
      plugin.deactivate();
      this.activePlugins.delete(pluginId);
      console.log(`Plugin ${pluginId} deactivated.`);
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
    }
  }

  public getActivePlugins(): StudyPlugin[] {
    return Array.from(this.activePlugins).map(id => this.plugins.get(id)!);
  }
}

export const pluginRegistry = new PluginRegistry();
