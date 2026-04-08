//! identity-service — World-Office identity and auth microservice
//!
//! Manages user accounts, authentication (JWT/OAuth2), RBAC,
//! and integration with external identity providers.

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Application state shared across handlers.
#[derive(Clone)]
struct AppState {
    jwt_secret: String,
}

/// Health check response.
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

/// Login request.
#[derive(Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

/// Login response with JWT token.
#[derive(Serialize)]
struct LoginResponse {
    token: String,
    expires_in: u64,
}

/// Token claims.
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    username: String,
    role: String,
    exp: usize,
    iat: usize,
}

/// Error response.
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
}

/// POST /auth/login — authenticate and return JWT.
async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, Json<ErrorResponse>)> {
    // TODO: Replace with real credential check against database
    if payload.username.is_empty() {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "Invalid credentials".into(),
                code: 401,
            }),
        ));
    }

    let claims = Claims {
        sub: payload.username.clone(),
        username: payload.username.clone(),
        role: "user".to_string(),
        exp: chrono::Utc::now().timestamp() as usize + 86400, // 24h
        iat: chrono::Utc::now().timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .unwrap_or_default();

    Ok(Json(LoginResponse {
        token,
        expires_in: 86400,
    }))
}

/// GET /health — liveness check.
async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "identity-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// POST /auth/verify — validate a JWT token.
#[derive(Deserialize)]
struct VerifyRequest {
    token: String,
}

#[derive(Serialize)]
struct VerifyResponse {
    valid: bool,
    username: String,
    role: String,
}

async fn verify(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, (StatusCode, Json<ErrorResponse>)> {
    let validation = decode::<Claims>(
        &payload.token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    );

    match validation {
        Ok(token_data) => Ok(Json(VerifyResponse {
            valid: true,
            username: token_data.claims.sub,
            role: token_data.claims.role,
        })),
        Err(_) => Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "Invalid or expired token".into(),
                code: 401,
            }),
        )),
    }
}

/// Build the application router.
fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/auth/login", post(login))
        .route("/auth/verify", post(verify))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret-change-in-production".into());

    let state = Arc::new(AppState { jwt_secret });
    let app = app(state);

    let addr = std::env::var("SERVICE_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "8001".into())
        .parse()
        .unwrap_or(8001);

    tracing::info!("identity-service v{} starting on {}:{}", env!("CARGO_PKG_VERSION"), addr, port);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", addr, port)).await.expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
