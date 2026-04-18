import { useCallback, useEffect, useRef, useState } from "react"
import { WebSocketManager, type ConnectionState, type EditOperation } from "@world-office/collaboration-client"
import type { CollaborationStore } from "@world-office/editor-stores"

export interface UseCollaborationOptions {
  wsUrl: string
  userId: string
  collaborationStore: CollaborationStore | null
  onRemoteOperation?: (op: EditOperation) => void
}

export interface UseCollaborationResult {
  connectionState: ConnectionState
  connect: () => void
  disconnect: () => void
  sendInsert: (position: number, text: string) => void
  sendDelete: (position: number, length: number) => void
}

export function useCollaboration(options: UseCollaborationOptions): UseCollaborationResult {
  const { wsUrl, userId, collaborationStore, onRemoteOperation } = options
  const managerRef = useRef<WebSocketManager | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")

  const getOrCreateManager = useCallback((): WebSocketManager => {
    if (!managerRef.current) {
      const manager = new WebSocketManager({
        url: wsUrl,
        userId,
        autoReconnect: true,
      })

      manager.on("stateChange", (state: ConnectionState) => {
        setConnectionState(state)
        collaborationStore?.setConnectionStatus(state)
      })

      manager.on("open", () => {
        collaborationStore?.setConnectionStatus("connected")
      })

      manager.on("close", () => {
        collaborationStore?.setConnectionStatus("disconnected")
      })

      manager.on("operation", (op: EditOperation) => {
        onRemoteOperation?.(op)
      })

      managerRef.current = manager
    }
    return managerRef.current
  }, [wsUrl, userId, collaborationStore, onRemoteOperation])

  const connect = useCallback(() => {
    const manager = getOrCreateManager()
    manager.connect()
  }, [getOrCreateManager])

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect()
    managerRef.current = null
  }, [])

  const sendInsert = useCallback((position: number, text: string) => {
    managerRef.current?.sendInsert(position, text)
  }, [])

  const sendDelete = useCallback((position: number, length: number) => {
    managerRef.current?.sendDelete(position, length)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.disconnect()
      managerRef.current = null
    }
  }, [])

  return {
    connectionState,
    connect,
    disconnect,
    sendInsert,
    sendDelete,
  }
}