//! identity-service — World-Office identity and auth microservice
//!
//! Manages user accounts, authentication (JWT), RBAC,
//! and integration with external identity providers.

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Stored user record.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    username: String,
    /// SHA-256 hex hash of the password.
    password_hash: String,
    role: String,
    created_at: String,
}

/// Application state shared across handlers.
#[derive(Clone)]
struct AppState {
    jwt_secret: String,
    users: Arc<Mutex<HashMap<String, User>>>,
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

/// Register request.
#[derive(Deserialize)]
struct RegisterRequest {
    username: String,
    password: String,
}

/// Register response.
#[derive(Serialize)]
struct RegisterResponse {
    username: String,
    message: String,
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

/// Hash a password using SHA-256.
fn hash_password(password: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hex::encode(hasher.finalize())
}

/// POST /auth/register — create a new user account.
async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.username.is_empty() || payload.username.len() < 3 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Username must be at least 3 characters".into(),
                code: 400,
            }),
        ));
    }

    if payload.password.is_empty() || payload.password.len() < 6 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Password must be at least 6 characters".into(),
                code: 400,
            }),
        ));
    }

    let mut users = state.users.lock().await;

    if users.contains_key(&payload.username) {
        return Err((
            StatusCode::CONFLICT,
            Json(ErrorResponse {
                error: format!("User '{}' already exists", payload.username),
                code: 409,
            }),
        ));
    }

    let user = User {
        username: payload.username.clone(),
        password_hash: hash_password(&payload.password),
        role: "user".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    users.insert(payload.username.clone(), user);

    tracing::info!(username = %payload.username, "user registered");

    Ok(Json(RegisterResponse {
        username: payload.username,
        message: "User registered successfully".into(),
    }))
}

/// POST /auth/login — authenticate and return JWT.
async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.username.is_empty() || payload.password.is_empty() {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "Invalid credentials".into(),
                code: 401,
            }),
        ));
    }

    let users = state.users.lock().await;

    let user = match users.get(&payload.username) {
        Some(u) => u,
        None => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ErrorResponse {
                    error: "Invalid credentials".into(),
                    code: 401,
                }),
            ));
        }
    };

    let input_hash = hash_password(&payload.password);
    if input_hash != user.password_hash {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "Invalid credentials".into(),
                code: 401,
            }),
        ));
    }

    let claims = Claims {
        sub: user.username.clone(),
        username: user.username.clone(),
        role: user.role.clone(),
        exp: chrono::Utc::now().timestamp() as usize + 86400, // 24h
        iat: chrono::Utc::now().timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .unwrap_or_default();

    tracing::info!(username = %user.username, "user logged in");

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
        .route("/auth/register", post(register))
        .route("/auth/verify", post(verify))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret-change-in-production".into());

    let state = Arc::new(AppState {
        jwt_secret,
        users: Arc::new(Mutex::new(HashMap::new())),
    });
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

#[cfg(test)]
mod tests {
    use super::*;

    fn make_state() -> Arc<AppState> {
        Arc::new(AppState {
            jwt_secret: "test-secret".into(),
            users: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    #[test]
    fn test_password_hashing() {
        let hash1 = hash_password("password123");
        let hash2 = hash_password("password123");
        let hash3 = hash_password("different");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
        assert_eq!(hash1.len(), 64); // SHA-256 hex = 64 chars
    }

    #[tokio::test]
    async fn test_register_and_login() {
        let state = make_state();

        // Register
        let router = Router::new()
            .route("/auth/register", post(register))
            .route("/auth/login", post(login))
            .with_state(state.clone());

        use axum::body::Body;
        use tower::ServiceExt;

        let reg_resp = router
            .clone()
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/register")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"testuser","password":"pass123"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(reg_resp.status(), StatusCode::OK);

        // Login
        let login_resp = router
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/login")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"testuser","password":"pass123"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(login_resp.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_register_duplicate_returns_409() {
        let state = make_state();

        let router = Router::new()
            .route("/auth/register", post(register))
            .with_state(state);

        use axum::body::Body;
        use tower::ServiceExt;

        // First registration
        let resp1 = router
            .clone()
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/register")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"dup","password":"pass123"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp1.status(), StatusCode::OK);

        // Duplicate
        let resp2 = router
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/register")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"dup","password":"pass123"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp2.status(), StatusCode::CONFLICT);
    }

    #[tokio::test]
    async fn test_login_wrong_password_returns_401() {
        let state = make_state();

        let router = Router::new()
            .route("/auth/register", post(register))
            .route("/auth/login", post(login))
            .with_state(state.clone());

        use axum::body::Body;
        use tower::ServiceExt;

        // Register first
        router
            .clone()
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/register")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"testuser2","password":"correct"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        // Login with wrong password
        let resp = router
            .oneshot(
                axum::http::Request::builder()
                    .method("POST")
                    .uri("/auth/login")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"username":"testuser2","password":"wrong"}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }
}
