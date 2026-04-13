// Event callback type utilities

import type { SdkCallbackEvent, SdkCallbackMap } from "./types"

type CallbackHandler<E extends SdkCallbackEvent> = SdkCallbackMap[E]

/**
 * Creates a type-safe event emitter for SDK callbacks.
 * Wraps the legacy asc_registerCallback/asc_unregisterCallback API.
 */
export class SdkEventEmitter {
  private handlers = new Map<string, Set<(...args: unknown[]) => void>>()

  /**
   * Register a callback for an SDK event
   */
  on<E extends SdkCallbackEvent>(event: E, handler: CallbackHandler<E>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)?.add(handler as (...args: unknown[]) => void)

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler as (...args: unknown[]) => void)
    }
  }

  /**
   * Emit an event (called internally by the bridge)
   */
  emit<E extends SdkCallbackEvent>(event: E, ...args: Parameters<CallbackHandler<E>>): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          ;(handler as (...a: unknown[]) => void)(...(args as unknown[]))
        } catch (err) {
          console.error(`[sdk-bridge] Error in ${event} handler:`, err)
        }
      }
    }
  }

  /**
   * Remove all handlers for a specific event
   */
  off(event: SdkCallbackEvent): void {
    this.handlers.delete(event)
  }

  /**
   * Remove all handlers for all events
   */
  clear(): void {
    this.handlers.clear()
  }
}
