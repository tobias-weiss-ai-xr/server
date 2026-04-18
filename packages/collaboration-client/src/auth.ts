/**
 * Auth client for session-service JWT management.
 *
 * Handles:
 * - Creating sessions and receiving access/refresh tokens
 * - Refreshing expired access tokens
 * - In-memory token storage
 *
 * Server endpoints (READ ONLY):
 * - POST /sessions          → { session_id, access_token, refresh_token, expires_in }
 * - POST /sessions/refresh  → { access_token, expires_in }
 */

export interface AuthClientOptions {
  baseUrl: string
}

export interface CreateSessionParams {
  userId: string
  username: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SessionInfo {
  sessionId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshResult {
  accessToken: string
  expiresIn: number
}

interface ErrorResponse {
  error: string
  code: number
}

export class AuthClient {
  private readonly baseUrl: string
  private accessToken: string | null = null
  private _refreshToken: string | null = null

  constructor(options: AuthClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "")
  }

  /** Create a new session and receive JWT tokens. */
  async createSession(params: CreateSessionParams): Promise<SessionInfo> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: params.userId, username: params.username }),
    })

    if (!response.ok) {
      const errorBody = (await response.json()) as ErrorResponse
      throw new Error(`Auth error ${response.status}: ${errorBody.error}`)
    }

    const data = (await response.json()) as {
      session_id: string
      access_token: string
      refresh_token: string
      expires_in: number
    }

    this.accessToken = data.access_token
    this._refreshToken = data.refresh_token

    return {
      sessionId: data.session_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  }

  /** Refresh an expired access token using the refresh token. */
  async refreshToken(token: string): Promise<RefreshResult> {
    const response = await fetch(`${this.baseUrl}/sessions/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token }),
    })

    if (!response.ok) {
      const errorBody = (await response.json()) as ErrorResponse
      throw new Error(`Auth error ${response.status}: ${errorBody.error}`)
    }

    const data = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    this.accessToken = data.access_token

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  }

  /** Store tokens manually (e.g., from external auth flow). */
  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken
    this._refreshToken = tokens.refreshToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this._refreshToken
  }

  hasToken(): boolean {
    return this.accessToken !== null
  }

  clearTokens(): void {
    this.accessToken = null
    this._refreshToken = null
  }
}
