//! session-service — World-Office session management microservice
//!
//! Handles user sessions, authentication token lifecycle,
//! and connection management for editor instances.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

/// Session state.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum SessionState {
    Active,
    Idle,
    Expired,
    Revoked,
}

/// A user session.
#[derive(Debug, Clone, Serialize)]
struct Session {
    id: String,
    user_id: String,
    username: String,
    state: SessionState,
    created_at: String,
    last_activity: String,
    expires_at: String,
    metadata: HashMap<String, String>,
}

/// Application state.
#[derive(Clone)]
struct AppState {
    sessions: Arc<Mutex<HashMap<String, Session>>>,
    jwt_secret: String,
    session_ttl_seconds: i64,
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
    user_id: String,
    username: String,
}

/// Create session response.
#[derive(Serialize)]
struct CreateSessionResponse {
    session_id: String,
    access_token: String,
    refresh_token: String,
    expires_in: i64,
}

/// Token refresh request.
#[derive(Deserialize)]
struct RefreshRequest {
    refresh_token: String,
}

/// Token refresh response.
#[derive(Serialize)]
struct RefreshResponse {
    access_token: String,
    expires_in: i64,
}

/// Session info response.
#[derive(Serialize)]
struct SessionInfoResponse {
    session: Session,
}

/// Error response.
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
}

/// JWT claims for session tokens.
#[derive(Debug, Serialize, Deserialize)]
struct SessionClaims {
    sub: String,
    username: String,
    session_id: String,
    #[serde(rename = "type")]
    token_type: String, // "access" or "refresh"
    exp: usize,
    iat: usize,
}

/// POST /sessions — create a new session and issue tokens.
async fn create_session(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateSessionRequest>,
) -> Result<Json<CreateSessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.user_id.is_empty() || payload.username.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "user_id and username are required".into(),
                code: 400,
            }),
        ));
    }

    let session_id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let ttl = state.session_ttl_seconds;

    let session = Session {
        id: session_id.clone(),
        user_id: payload.user_id.clone(),
        username: payload.username.clone(),
        state: SessionState::Active,
        created_at: now.to_rfc3339(),
        last_activity: now.to_rfc3339(),
        expires_at: (now + chrono::Duration::seconds(ttl)).to_rfc3339(),
        metadata: HashMap::new(),
    };

    // Issue access token (short-lived: 15 minutes)
    let access_claims = SessionClaims {
        sub: payload.user_id.clone(),
        username: payload.username.clone(),
        session_id: session_id.clone(),
        token_type: "access".into(),
        exp: (now.timestamp() + 900) as usize,
        iat: now.timestamp() as usize,
    };

    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .unwrap_or_default();

    // Issue refresh token (long-lived: matches session TTL)
    let refresh_claims = SessionClaims {
        sub: payload.user_id.clone(),
        username: payload.username.clone(),
        session_id: session_id.clone(),
        token_type: "refresh".into(),
        exp: (now.timestamp() + ttl) as usize,
        iat: now.timestamp() as usize,
    };

    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .unwrap_or_default();

    {
        let mut sessions = state.sessions.lock().await;
        sessions.insert(session_id.clone(), session);
    }

    tracing::info!(
        session_id = %session_id,
        user_id = %payload.user_id,
        "session created"
    );

    Ok(Json(CreateSessionResponse {
        session_id,
        access_token,
        refresh_token,
        expires_in: ttl,
    }))
}

/// POST /sessions/refresh — refresh an access token using a refresh token.
async fn refresh_session(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RefreshRequest>,
) -> Result<Json<RefreshResponse>, (StatusCode, Json<ErrorResponse>)> {
    use jsonwebtoken::{decode, DecodingKey, Validation};

    let token_data = decode::<SessionClaims>(
        &payload.refresh_token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| (
        StatusCode::UNAUTHORIZED,
        Json(ErrorResponse {
            error: "Invalid or expired refresh token".into(),
            code: 401,
        }),
    ))?;

    let claims = token_data.claims;

    if claims.token_type != "refresh" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Expected a refresh token".into(),
                code: 400,
            }),
        ));
    }

    // Verify session still exists and is active
    {
        let sessions = state.sessions.lock().await;
        match sessions.get(&claims.session_id) {
            Some(session) if session.state == SessionState::Active => {}
            Some(_) => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse {
                        error: "Session is no longer active".into(),
                        code: 401,
                    }),
                ));
            }
            None => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: "Session not found".into(),
                        code: 404,
                    }),
                ));
            }
        }
    }

    let session_id = claims.session_id;
    let username = claims.username;
    let now = Utc::now();

    // Issue new access token
    let new_access_claims = SessionClaims {
        sub: claims.sub,
        username,
        session_id: session_id.clone(),
        token_type: "access".into(),
        exp: (now.timestamp() + 900) as usize,
        iat: now.timestamp() as usize,
    };

    let access_token = encode(
        &Header::default(),
        &new_access_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .unwrap_or_default();

    tracing::info!(
        session_id = %session_id,
        "access token refreshed"
    );

    Ok(Json(RefreshResponse {
        access_token,
        expires_in: 900,
    }))
}

/// GET /sessions/{id} — get session info.
async fn get_session(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
) -> Result<Json<SessionInfoResponse>, (StatusCode, Json<ErrorResponse>)> {
    let sessions = state.sessions.lock().await;

    match sessions.get(&session_id) {
        Some(session) => Ok(Json(SessionInfoResponse { session: session.clone() })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("Session {} not found", session_id),
                code: 404,
            }),
        )),
    }
}

/// DELETE /sessions/{id} — revoke a session.
async fn revoke_session(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    let mut sessions = state.sessions.lock().await;

    match sessions.get_mut(&session_id) {
        Some(session) => {
            session.state = SessionState::Revoked;
            session.last_activity = Utc::now().to_rfc3339();
            tracing::info!(session_id = %session_id, "session revoked");
            Ok(Json(serde_json::json!({
                "session_id": session_id,
                "status": "revoked"
            })))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("Session {} not found", session_id),
                code: 404,
            }),
        )),
    }
}

/// GET /sessions — list all sessions.
async fn list_sessions(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<Session>> {
    let sessions = state.sessions.lock().await;
    let all: Vec<Session> = sessions.values().cloned().collect();
    Json(all)
}

/// GET /health — liveness check.
async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "session-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/sessions", post(create_session).get(list_sessions))
        .route("/sessions/{id}", get(get_session).delete(revoke_session))
        .route("/sessions/refresh", post(refresh_session))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret-change-in-production".into());
    let session_ttl: i64 = std::env::var("SESSION_TTL_SECONDS")
        .unwrap_or_else(|_| "86400".into())
        .parse()
        .unwrap_or(86400);

    let state = Arc::new(AppState {
        sessions: Arc::new(Mutex::new(HashMap::new())),
        jwt_secret,
        session_ttl_seconds: session_ttl,
    });
    let app = app(state);

    let addr = std::env::var("SERVICE_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "8005".into())
        .parse()
        .unwrap_or(8005);

    tracing::info!("session-service v{} starting on {}:{}", env!("CARGO_PKG_VERSION"), addr, port);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", addr, port))
        .await
        .expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
