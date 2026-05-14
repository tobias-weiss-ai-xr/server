# Collaboration Session Flow & Presence Broadcast

> **Status:** Design approved, implementation pending
> **Created:** 2026-05-14
> **Author:** Sisyphus

## Overview

This design covers the implementation of the missing end-to-end session flow and presence broadcast for real-time co-editing in World-Office.

**Goal:** Wire the existing `AuthClient` → session creation → WebSocket connect flow, add `ParticipantUpdate` message protocol, implement server-side presence broadcast on connect/disconnect/cursor-move, and add initial CRDT state sync for users joining mid-session.

**Context:** The collaboration client packages (`collaboration-client`, `collaboration-react`) are already complete implementations — not stubs. The gap is purely the integration/ wiring of the session flow and presence broadcast.

---

## Architecture

### Data Flow

```
User opens document
        │
        ▼
storage-service ──sessionId──▶ coauthoring-service (session pre-created per document)
        │                              │
        │ sessionId + WOPI token       │
        ▼                              ▼
   Editor UI ◀──── JWT ─────── WebSocketManager.connect(sessionId)
        │                       │                        │
        │              AuthClient.createSession          │
        │              (REST → session-service)          │
        │                       │                        │
        │              AuthClient.joinSession            │
        │              (REST → coauthoring-service)      │
        │                       │                        │
        │                       ▼                        │
        │              WebSocket connected               │
        │                       │                        │
        ▼              ┌────────▼────────┐               │
  collaboration-◀───── │ server sends    │               │
  Store.setPresence() │ 1. Initial CRDT │               │
        │             │ 2. ParticipantList│              │
        │             │ (existing users)  │              │
        │             └───────────────────┘               │
        ▼                                                │
useCollaboration ──onRemoteOperation──▶ Editor applies to CRDT
```

### Key Design Decisions

- **Session pre-created by storage-service** — not auto-created by client
- **Auto-reconnect on transient failures** — `WebSocketManager` already has backoff reconnection
- **No document state sync on initial join** — deferred (initial focus is session flow + presence)
- **Presence events broadcast to all OTHER clients** — not to self

---

## Files to Modify

### TypeScript (client)

| File | Change |
|------|--------|
| `packages/collaboration-client/src/protocol.ts` | Add `ParticipantUpdate`, `ParticipantEvent`, `InitialState` types |
| `packages/collaboration-client/src/client.ts` | Add `connect(sessionId, token)` overload that accepts token; add `onParticipantUpdate` handler |
| `packages/collaboration-react/hooks/useCollaboration.ts` | Wire `AuthClient.createSession` → `POST /sessions/{id}/join` → `manager.connect()` |

### Rust (server)

| File | Change |
|------|--------|
| `services/coauthoring-service/src/protocol.rs` | Add `ParticipantUpdate`, `ParticipantEvent`, `InitialState` message types; update `Message` enum |
| `services/coauthoring-service/src/main.rs` | Add participant tracking map; update `handle_ws` for presence broadcast and initial state send |

---

## Protocol

### Message Types

```rust
// New message type added to coauthoring-service
pub enum Message {
    Edit(EditOperation),
    ParticipantUpdate(ParticipantUpdate),  // NEW
}

pub struct ParticipantUpdate {
    pub event: ParticipantEvent,
    pub user_id: String,
    pub username: String,
    pub color: String,                    // Assigned by server on join
    pub cursor_position: Option<CursorPos>, // For CursorMoved events
}

pub enum ParticipantEvent {
    Joined,
    Left,
    CursorMoved,
}

pub struct InitialState {
    pub crdt_bytes: Vec<u8>,              // Serialized CRDT document
    pub participants: Vec<Participant>,   // All current participants
}
```

### Message Flow

**Client connects:**
1. Server adds client sender to session's participant map
2. Server sends `InitialState { crdt_bytes, participants }` to new client
3. Server broadcasts `ParticipantUpdate { Joined, ... }` to all OTHER clients

**Client cursor moves:**
1. Client sends `ParticipantUpdate { CursorMoved, cursor_position: Some(...) }` via WebSocket
2. Server broadcasts to all OTHER clients

**Client disconnects:**
1. Server detects (read loop drops channel)
2. Server removes client from participant map
3. Server broadcasts `ParticipantUpdate { Left, ... }` to remaining clients

---

## Client Integration Flow

### useCollaboration.ts Changes

```typescript
async function connect() {
  const { sessionId, documentId } = useCollaboration.getState();

  // Step 1: Get session from storage-service (pre-created per document)
  const sessionResponse = await fetch(`${STORAGE_SERVICE_URL}/sessions/${documentId}`);
  const { id: sessionId, wopiToken } = await sessionResponse.json();

  // Step 2: Authenticate with session-service
  const authClient = new AuthClient(SESSION_SERVICE_URL);
  const { accessToken } = await authClient.createSession({
    userId: currentUser.id,
    username: currentUser.name
  });

  // Step 3: Join session via coauthoring-service REST
  await fetch(`${COAUTHORING_SERVICE_URL}/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: currentUser.id,
      username: currentUser.name,
      wopi_token: wopiToken
    })
  });

  // Step 4: Connect WebSocket with sessionId and token
  const manager = getOrCreateManager(sessionId);
  manager.connect(sessionId, accessToken);
}
```

### WebSocketManager Changes

- Add `connect(sessionId: string, accessToken?: string)` overload that attaches JWT to WS `Sec-WebSocket-Protocol` header or URL query param
- Add `onParticipantUpdate` event handler that emits `participant_update` events

### Protocol.ts Type Changes

```typescript
export interface ParticipantUpdate {
  event: 'joined' | 'left' | 'cursor_moved';
  user_id: string;
  username: string;
  color: string;
  cursor_position?: CursorPosition;
}

export interface InitialState {
  crdt_bytes: Uint8Array;
  participants: Participant[];
}

export type ServerMessage =
  | { type: 'edit'; operation: EditOperation }
  | { type: 'participant_update'; update: ParticipantUpdate }
  | { type: 'initial_state'; state: InitialState };
```

---

## Server Changes

### Protocol.rs Changes

Add to the `Message` enum:
```rust
pub enum Message {
    Edit(EditOperation),
    ParticipantUpdate(ParticipantUpdate),
}

pub struct ParticipantUpdate {
    pub event: ParticipantEvent,
    pub user_id: String,
    pub username: String,
    pub color: String,
    pub cursor_position: Option<CursorPos>,
}

pub enum ParticipantEvent {
    Joined,
    Left,
    CursorMoved,
}

pub struct InitialState {
    pub crdt_bytes: Vec<u8>,
    pub participants: Vec<Participant>,
}
```

### Main.rs Changes

**1. Track participant sender channels per session:**
```rust
struct SessionState {
    doc: Arc<Mutex<Document>>,
    participants: HashMap<String, broadcast::Sender<ParticipantUpdate>>,
    edit_tx: broadcast::Sender<String>,
}
```

**2. In `handle_ws` — on new client connect:**
```rust
// Add to participants map
let participant_tx = session_state.participants.insert(user_id.clone(), participant_update_tx.clone());

// Broadcast Joined to all OTHER clients
let joined_update = ParticipantUpdate {
    event: ParticipantEvent::Joined,
    user_id: user_id.clone(),
    username: username.clone(),
    color: color.clone(),
    cursor_position: None,
};
for (uid, tx) in &session_state.participants {
    if uid != &user_id {
        let _ = tx.send(joined_update.clone());
    }
}

// Send InitialState to new client (includes their own entry)
let initial_state = InitialState {
    crdt_bytes: serialize_crdt(&session_state.doc.lock().unwrap()),
    participants: build_participant_list(&session_state.participants),
};
let msg = Message::InitialState(initial_state);
let encoded = serialize(&msg)?;
ws_stream.send(Message::Text(encoded.into())).await?;
```

**3. In `handle_ws` — on disconnect (read loop drops):**
```rust
// Remove from participants
session_state.participants.remove(&user_id);

// Broadcast Left to remaining
let left_update = ParticipantUpdate {
    event: ParticipantEvent::Left,
    user_id: user_id.clone(),
    username: username.clone(),
    color: color.clone(),
    cursor_position: None,
};
for (_, tx) in &session_state.participants {
    let _ = tx.send(left_update.clone());
}
```

**4. Add cursor position update handling in WS read loop:**
```rust
Message::ParticipantUpdate(update) => {
    // Broadcast to all OTHER clients
    for (uid, tx) in &session_state.participants {
        if uid != &user_id {
            let _ = tx.send(update.clone());
        }
    }
}
```

---

## Error Handling

- **Session not found (404):** Return error to client, surface in editor UI
- **Auth failure (401):** Clear tokens, prompt re-authentication
- **WebSocket disconnect:** `WebSocketManager` auto-reconnects with exponential backoff (already implemented)
- **Server presence broadcast failure:** Log and continue (non-critical)

---

## Testing

1. **Unit tests** for `ParticipantUpdate` serialization/deserialization in both Rust and TypeScript
2. **Integration test** in `coauthoring-service`: connect 2 clients, verify both receive `Joined` updates
3. **Integration test**: client disconnects, verify remaining client receives `Left` update
4. **E2E test**: open document, verify presence UI updates when second user joins

---

## Validation

After implementation:
1. `cargo check -p coauthoring-service` passes
2. `pnpm typecheck` passes (TypeScript)
3. `cargo test -p coauthoring-service` passes
4. E2E: two browser tabs, same document, verify cursors/presence appear in both

---

## Notes

- Session pre-creation by storage-service implies a `POST /sessions` or `GET /sessions/{documentId}` endpoint exists — this needs to be confirmed against the actual storage-service API
- The CRDT serialization format for `InitialState.crdt_bytes` needs a `serialize_crdt` function in the Rust server — `diamond-types` may have a serialization method
- JWT token attachment to WebSocket: currently using `Sec-WebSocket-Protocol` header (standard approach) — verify client-side WebSocket API supports this
- The `wopi_token` flow for session join authorization needs to match how storage-service generates tokens