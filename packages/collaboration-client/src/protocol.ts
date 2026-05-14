/**
 * Protocol types for the coauthoring-service WebSocket protocol.
 *
 * These types match the server's Rust structs exactly. The server uses
 * serde JSON serialization with camelCase field names.
 *
 * IMPORTANT: These types are READ-ONLY reference. The server protocol
 * is defined in services/coauthoring-service/src/main.rs.
 */

// ── Cursor ──

export interface CursorPosition {
  page: number
  x: number
  y: number
}

// ── Participant ──

export interface Participant {
  user_id: string
  username: string
  color: string
  cursor_position: CursorPosition | null
}

// ── Edit Operation ──

/** Discriminated union for client-to-server edit messages. */
export type EditOperation = InsertOperation | DeleteOperation

export interface BaseEditOperation {
  session_id: string
  user_id: string
  revision: number
  timestamp: string
}

export interface InsertOperation extends BaseEditOperation {
  type: "insert"
  position: number
  length: 0
  content: string
}

export interface DeleteOperation extends BaseEditOperation {
  type: "delete"
  position: number
  length: number
  content: null
}

// ── Participant Update ──

/** Participant update event types. */
export type ParticipantEvent = "joined" | "left" | "cursor_moved"

/**
 * A presence update sent over WebSocket when a participant joins, leaves,
 * or moves their cursor.
 */
export interface ParticipantUpdate {
  event: ParticipantEvent
  user_id: string
  username: string
  color: string
  cursor_position?: CursorPosition
}

/**
 * Initial state sent to a new WebSocket client upon connect, containing
 * the current CRDT document bytes and all current participants.
 */
export interface InitialState {
  crdt_bytes: Uint8Array
  participants: Participant[]
}

/**
 * Discriminated union for all messages received from the server over WebSocket.
 */
export type ServerMessage =
  | { type: "edit"; operation: EditOperation }
  | { type: "participant_update"; update: ParticipantUpdate }
  | { type: "initial_state"; state: InitialState }

// ── Server REST Responses ──

export interface CreateSessionResponse {
  session_id: string
  document_id: string
  message: string
}

export interface JoinSessionResponse {
  session_id: string
  participants: Participant[]
  message: string
}

export interface EditorSession {
  session_id: string
  document_id: string
  created_at: string
  last_activity: string
  participants: Participant[]
}

// ── Helpers ──

/** Create an insert operation with auto-generated timestamp. */
export function createInsertOp(params: {
  session_id: string
  user_id: string
  position: number
  text: string
  revision?: number
}): InsertOperation {
  return {
    session_id: params.session_id,
    user_id: params.user_id,
    revision: params.revision ?? 0,
    type: "insert",
    position: params.position,
    length: 0,
    content: params.text,
    timestamp: new Date().toISOString(),
  }
}

/** Create a delete operation with auto-generated timestamp. */
export function createDeleteOp(params: {
  session_id: string
  user_id: string
  position: number
  length: number
  revision?: number
}): DeleteOperation {
  return {
    session_id: params.session_id,
    user_id: params.user_id,
    revision: params.revision ?? 0,
    type: "delete",
    position: params.position,
    length: params.length,
    content: null,
    timestamp: new Date().toISOString(),
  }
}

/** Parse a JSON string into a ServerMessage, or return null if invalid. */
export function parseServerMessage(json: string): ServerMessage | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  if (typeof parsed !== "object" || parsed === null) return null
  const obj = parsed as Record<string, unknown>

  if (obj.type === "edit" && typeof obj.operation === "object") {
    return { type: "edit", operation: obj.operation as EditOperation }
  }
  if (obj.type === "participant_update" && typeof obj.update === "object") {
    return { type: "participant_update", update: obj.update as ParticipantUpdate }
  }
  if (obj.type === "initial_state" && typeof obj.state === "object") {
    return { type: "initial_state", state: obj.state as InitialState }
  }

  return null
}

/** Create a participant update for cursor movement. */
export function createCursorUpdate(params: {
  session_id: string
  user_id: string
  username: string
  color: string
  cursor_position: CursorPosition
}): ParticipantUpdate {
  return {
    event: "cursor_moved",
    user_id: params.user_id,
    username: params.username,
    color: params.color,
    cursor_position: params.cursor_position,
  }
}

/** Parse a JSON string into an EditOperation, or return null if invalid. */
export function parseMessage(json: string): EditOperation | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  if (typeof parsed !== "object" || parsed === null) return null
  const obj = parsed as Record<string, unknown>

  if (obj.type !== "insert" && obj.type !== "delete") return null
  if (typeof obj.session_id !== "string") return null
  if (typeof obj.user_id !== "string") return null

  return obj as unknown as EditOperation
}

/** Check if an operation was authored by a different user. */
export function isRemoteMessage(op: EditOperation, currentUserId: string): boolean {
  return op.user_id !== currentUserId
}
