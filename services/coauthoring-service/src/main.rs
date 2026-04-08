//! coauthoring-service — World-Office real-time collaboration microservice
//!
//! Manages WebSocket connections, operational transforms, and
//! document lock/sync for multi-user editing sessions.

use axum::{
    extract::{Path, State, WebSocketUpgrade, ws::{Message, WebSocket}},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};

/// A connected editor session.
#[derive(Debug, Clone, Serialize)]
struct EditorSession {
    session_id: String,
    document_id: String,
    created_at: String,
    participants: Vec<Participant>,
}

/// A participant in a co-authoring session.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Participant {
    user_id: String,
    username: String,
    color: String,
    cursor_position: Option<CursorPos>,
}

/// Cursor position for visual feedback.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct CursorPos {
    page: u32,
    x: f64,
    y: f64,
}

/// An operational transform edit.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct EditOperation {
    session_id: String,
    user_id: String,
    revision: u64,
    #[serde(rename = "type")]
    op_type: String, // "insert", "delete", "format"
    position: u64,
    length: u64,
    content: Option<String>,
    timestamp: String,
}

/// Application state.
#[derive(Clone)]
struct AppState {
    sessions: Arc<Mutex<HashMap<String, EditorSession>>>,
    /// Broadcast channels per session for real-time edits.
    edit_channels: Arc<Mutex<HashMap<String, broadcast::Sender<String>>>>,
}

/// Health check response.
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

/// Create session request.
#[derive(Deserialize)]
struct CreateSessionRequest {
    document_id: String,
}

/// Create session response.
#[derive(Serialize)]
struct CreateSessionResponse {
    session_id: String,
    document_id: String,
    message: String,
}

/// Join session request.
#[derive(Deserialize)]
struct JoinSessionRequest {
    user_id: String,
    username: String,
}

/// Join session response.
#[derive(Serialize)]
struct JoinSessionResponse {
    session_id: String,
    participants: Vec<Participant>,
    message: String,
}

/// Error response.
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
}

/// Preset editor colors for participant differentiation.
const EDITOR_COLORS: &[&str] = &[
    "#E74C3C", "#3498DB", "#2ECC71", "#F39C12",
    "#9B59B6", "#1ABC9C", "#E67E22", "#34495E",
];

/// POST /sessions — create a new co-authoring session.
async fn create_session(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateSessionRequest>,
) -> Result<Json<CreateSessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.document_id.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "document_id is required".into(),
                code: 400,
            }),
        ));
    }

    let session_id = uuid::Uuid::new_v4().to_string();
    let session = EditorSession {
        session_id: session_id.clone(),
        document_id: payload.document_id.clone(),
        created_at: Utc::now().to_rfc3339(),
        participants: Vec::new(),
    };

    // Create broadcast channel for this session
    let (tx, _) = broadcast::channel::<String>(256);
    {
        let mut channels = state.edit_channels.lock().await;
        channels.insert(session_id.clone(), tx);
    }

    {
        let mut sessions = state.sessions.lock().await;
        sessions.insert(session_id.clone(), session);
    }

    tracing::info!(
        session_id = %session_id,
        document_id = %payload.document_id,
        "co-authoring session created"
    );

    Ok(Json(CreateSessionResponse {
        session_id,
        document_id: payload.document_id,
        message: "Session created. Connect via WebSocket at /ws/{session_id}.".into(),
    }))
}

/// POST /sessions/{id}/join — join an existing session.
async fn join_session(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
    Json(payload): Json<JoinSessionRequest>,
) -> Result<Json<JoinSessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut sessions = state.sessions.lock().await;

    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("Session {} not found", session_id),
                code: 404,
            }),
        ))?;

    let color_index = session.participants.len() % EDITOR_COLORS.len();
    let username = payload.username.clone();
    let participant = Participant {
        user_id: payload.user_id,
        username: payload.username,
        color: EDITOR_COLORS[color_index].to_string(),
        cursor_position: None,
    };

    session.participants.push(participant.clone());
    let participants = session.participants.clone();

    tracing::info!(
        session_id = %session_id,
        username = %username,
        "participant joined session"
    );

    Ok(Json(JoinSessionResponse {
        session_id,
        participants,
        message: "Joined session successfully.".into(),
    }))
}

/// GET /sessions/{id} — get session info.
async fn get_session(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
) -> Result<Json<EditorSession>, (StatusCode, Json<ErrorResponse>)> {
    let sessions = state.sessions.lock().await;

    match sessions.get(&session_id) {
        Some(session) => Ok(Json(session.clone())),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("Session {} not found", session_id),
                code: 404,
            }),
        )),
    }
}

/// GET /sessions — list all active sessions.
async fn list_sessions(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<EditorSession>> {
    let sessions = state.sessions.lock().await;
    let all: Vec<EditorSession> = sessions.values().cloned().collect();
    Json(all)
}

/// GET /ws/{session_id} — WebSocket upgrade for real-time editing.
async fn ws_upgrade(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
    ws: WebSocketUpgrade,
) -> impl axum::response::IntoResponse {
    ws.on_upgrade(move |socket| handle_ws(socket, state, session_id))
}

/// Handle an individual WebSocket connection.
async fn handle_ws(mut socket: WebSocket, state: Arc<AppState>, session_id: String) {
    // Subscribe to the session's broadcast channel
    let rx = {
        let channels = state.edit_channels.lock().await;
        channels
            .get(&session_id)
            .map(|tx| tx.subscribe())
    };

    let mut rx = match rx {
        Some(rx) => rx,
        None => {
            let _ = socket
                .send(Message::Text(
                    format!("{{\"error\":\"Session {} not found\"}}", session_id).into(),
                ))
                .await;
            return;
        }
    };

    tracing::info!(session_id = %session_id, "WebSocket connected");

    // Split the WebSocket into sender and receiver
    let (mut ws_sender, mut ws_receiver) = socket.split();

    // Forward edits from other participants to this client
    let recv_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if ws_sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // Read edits from this client and broadcast
    while let Some(Ok(msg)) = ws_receiver.next().await {
        if let Message::Text(text) = msg {
            // TODO: validate and apply OT
            let channels = state.edit_channels.lock().await;
            if let Some(tx) = channels.get(&session_id) {
                let _ = tx.send(text.to_string());
            }
        }
    }

    recv_task.abort();
    tracing::info!(session_id = %session_id, "WebSocket disconnected");
}

/// GET /health — liveness check.
async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "coauthoring-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/sessions", post(create_session).get(list_sessions))
        .route("/sessions/{id}", get(get_session))
        .route("/sessions/{id}/join", post(join_session))
        .route("/ws/{session_id}", get(ws_upgrade))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = Arc::new(AppState {
        sessions: Arc::new(Mutex::new(HashMap::new())),
        edit_channels: Arc::new(Mutex::new(HashMap::new())),
    });
    let app = app(state);

    let addr = std::env::var("SERVICE_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "8004".into())
        .parse()
        .unwrap_or(8004);

    tracing::info!("coauthoring-service v{} starting on {}:{}", env!("CARGO_PKG_VERSION"), addr, port);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", addr, port))
        .await
        .expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
