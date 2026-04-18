// CollaborationStore — users, comments, chat, co-editing state

import { action, observable } from "mobx"

export interface CollabUser {
  id: string
  name: string
  color: string
  isCurrentUser: boolean
}

export interface CollabComment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: number
  resolved: boolean
  replies: CollabComment[]
}

export class CollaborationStore {
  @observable isConnected = false
  @observable users: CollabUser[] = []
  @observable comments: CollabComment[] = []
  @observable isCommentMode = false
  @observable currentUser: CollabUser | null = null

  // ── Connection state (Phase A) ──
  @observable connectionStatus: "disconnected" | "connecting" | "connected" | "reconnecting" = "disconnected"
  @observable sessionId: string | null = null
  @observable remoteCursors: Map<string, { page: number; x: number; y: number }> = new Map()

  @action
  setConnected(connected: boolean): void {
    this.isConnected = connected
  }

  // ── Connection actions (Phase A) ──

  @action
  setConnectionStatus(status: "disconnected" | "connecting" | "connected" | "reconnecting"): void {
    this.connectionStatus = status
    this.isConnected = status === "connected"
  }

  @action
  setSessionId(id: string | null): void {
    this.sessionId = id
  }

  @action
  updateRemoteCursor(userId: string, cursor: { page: number; x: number; y: number }): void {
    this.remoteCursors.set(userId, cursor)
  }

  @action
  removeRemoteCursor(userId: string): void {
    this.remoteCursors.delete(userId)
  }

  @action
  setUsers(users: CollabUser[]): void {
    this.users = users
    this.currentUser = users.find((u) => u.isCurrentUser) ?? null
  }

  @action
  addUser(user: CollabUser): void {
    if (!this.users.some((u) => u.id === user.id)) {
      this.users.push(user)
    }
  }

  @action
  removeUser(userId: string): void {
    this.users = this.users.filter((u) => u.id !== userId)
  }

  @action
  setComments(comments: CollabComment[]): void {
    this.comments = comments
  }

  @action
  addComment(comment: CollabComment): void {
    this.comments.push(comment)
  }

  @action
  resolveComment(commentId: string): void {
    const comment = this.comments.find((c) => c.id === commentId)
    if (comment) comment.resolved = true
  }

  @action
  addReply(commentId: string, reply: CollabComment): void {
    const comment = this.comments.find((c) => c.id === commentId)
    if (comment) comment.replies.push(reply)
  }

  @action
  setCommentMode(enabled: boolean): void {
    this.isCommentMode = enabled
  }

  @action
  reset(): void {
    this.isConnected = false
    this.users = []
    this.comments = []
    this.isCommentMode = false
    this.currentUser = null
    this.connectionStatus = "disconnected"
    this.sessionId = null
    this.remoteCursors.clear()
  }
}
