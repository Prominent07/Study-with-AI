/**
 * core/events/EventBus.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized, lightweight Pub/Sub system for decoupling application logic.
 */

import type { EventType, EventPayloadMap, BaseEvent } from './eventTypes';

type EventCallback<T extends EventType> = (event: BaseEvent<T, EventPayloadMap[T]>) => void;

class EventBus {
  private listeners: Map<EventType, Set<EventCallback<any>>> = new Map();

  /**
   * Subscribe to an event
   * @returns an unsubscribe function
   */
  public subscribe<T extends EventType>(type: T, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => this.unsubscribe(type, callback);
  }

  /**
   * Unsubscribe from an event
   */
  public unsubscribe<T extends EventType>(type: T, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  public emit<T extends EventType>(type: T, payload: EventPayloadMap[T]): void {
    const callbacks = this.listeners.get(type);
    if (!callbacks) return;

    const event: BaseEvent<T, EventPayloadMap[T]> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Execute asynchronously to avoid blocking the current execution stack
    setTimeout(() => {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${type}:`, error);
        }
      });
    }, 0);
  }
}

// Export a singleton instance
export const systemEvents = new EventBus();
