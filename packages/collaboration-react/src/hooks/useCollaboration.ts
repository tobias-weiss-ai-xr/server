import { useCallback, useEffect, useRef, useState } from "react"
import {
  WebSocketManager,
  type ConnectionState,
  type EditOperation,
  type ParticipantUpdate,
  type InitialState,
} from "@world-office/collaboration-client"
import { AuthClient } from "@world-office/collaboration-client"
import type { CollaborationStore } from "@world-office/editor-stores"

export interface UseCollaborationOptions {
  wsUrl: string
  userId: string
  username: string
  collaborationStore: CollaborationStore | null
  /** Pre-created session ID from storage-service. */
  sessionId?: string
  /** REST API base URL for session-service. */
  sessionServiceUrl?: string
  /** REST API base URL for coauthoring-service. */
  coauthoringServiceUrl?: string
  onRemoteOperation?: (op: EditOperation) => void
  onParticipantUpdate?: (update: ParticipantUpdate) => void
  onInitialState?: (state: InitialState) => void
}

export interface UseCollaborationResult {
  connectionState: ConnectionState
  connect: () => void
  disconnect: () => void
  sendInsert: (position: number, text: string) => void
  sendDelete: (position: number, length: number) => void
}

export function useCollaboration(options: UseCollaborationOptions): UseCollaborationResult {
  const {
    wsUrl,
    userId,
    username,
    collaborationStore,
    sessionId: preCreatedSessionId,
    sessionServiceUrl = "http://localhost:8001",
    coauthoringServiceUrl = "http://localhost:8004",
    onRemoteOperation,
    onParticipantUpdate,
    onInitialState,
  } = options

  const managerRef = useRef<WebSocketManager | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")

  const getOrCreateManager = useCallback(
    (resolvedSessionId: string, token: string): WebSocketManager => {
      const url = wsUrl.replace("{session_id}", resolvedSessionId)
      if (!managerRef.current || managerRef.current.state === "disconnected") {
        const manager = new WebSocketManager({
          url,
          userId,
          token,
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

        manager.on("participantUpdate", (update: ParticipantUpdate) => {
          if (update.event === "joined") {
            collaborationStore?.addUser({
              id: update.user_id,
              name: update.username,
              color: update.color,
              isCurrentUser: false,
            })
          } else if (update.event === "left") {
            collaborationStore?.removeUser(update.user_id)
          } else if (update.event === "cursor_moved" && update.cursor_position) {
            collaborationStore?.updateRemoteCursor(update.user_id, {
              page: update.cursor_position.page,
              x: update.cursor_position.x,
              y: update.cursor_position.y,
            })
          }
          onParticipantUpdate?.(update)
        })

        manager.on("initialState", (state: InitialState) => {
          onInitialState?.(state)
        })

        managerRef.current = manager
        tokenRef.current = token
      }
      return managerRef.current
    },
    [wsUrl, userId, collaborationStore, onRemoteOperation, onParticipantUpdate, onInitialState],
  )

  const connect = useCallback(async () => {
    try {
      let resolvedSessionId = preCreatedSessionId

      if (!resolvedSessionId) {
        const createResp = await fetch(`${coauthoringServiceUrl}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document_id: "default-doc" }),
        })
        if (!createResp.ok) throw new Error("Failed to create session")
        const data = (await createResp.json()) as { session_id: string }
        resolvedSessionId = data.session_id
      }

      const authClient = new AuthClient({ baseUrl: sessionServiceUrl })
      const { accessToken } = await authClient.createSession({ userId, username })

      await fetch(`${coauthoringServiceUrl}/sessions/${resolvedSessionId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, username }),
      })

      const manager = getOrCreateManager(resolvedSessionId, accessToken)
      manager.connect(resolvedSessionId, accessToken)
    } catch (err) {
      console.error("[useCollaboration] connect failed:", err)
    }
  }, [
    preCreatedSessionId,
    userId,
    username,
    sessionServiceUrl,
    coauthoringServiceUrl,
    getOrCreateManager,
  ])

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect()
    managerRef.current = null
    tokenRef.current = null
  }, [])

  const sendInsert = useCallback((position: number, text: string) => {
    managerRef.current?.sendInsert(position, text)
  }, [])

  const sendDelete = useCallback((position: number, length: number) => {
    managerRef.current?.sendDelete(position, length)
  }, [])

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