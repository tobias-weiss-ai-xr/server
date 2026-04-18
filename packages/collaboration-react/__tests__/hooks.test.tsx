import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCollaboration } from "../src/hooks/useCollaboration"

function createMockWebSocket() {
  let onopen: (() => void) | null = null
  let onclose: ((ev: CloseEvent) => void) | null = null
  let onmessage: ((ev: MessageEvent) => void) | null = null
  let onerror: ((ev: Event) => void) | null = null

  const mockWs = {
    readyState: 0 as number,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      if (event === "open") onopen = handler as () => void
      if (event === "close") onclose = handler as (ev: CloseEvent) => void
      if (event === "message") onmessage = handler as (ev: MessageEvent) => void
      if (event === "error") onerror = handler as (ev: Event) => void
    }),
    removeEventListener: vi.fn(),
  }

  return {
    mockWs,
    simulateOpen() { mockWs.readyState = 1; onopen?.() },
    simulateMessage(data: string) { onmessage?.(new MessageEvent("message", { data })) },
    simulateClose(code = 1000, reason = "") {
      mockWs.readyState = 3
      onclose?.(new CloseEvent("close", { code, reason, wasClean: code === 1000 }))
    },
  }
}

describe("useCollaboration", () => {
  let wsHelper: ReturnType<typeof createMockWebSocket>

  beforeEach(() => {
    vi.stubGlobal("WebSocket", vi.fn().mockImplementation(() => {
      wsHelper = createMockWebSocket()
      return wsHelper.mockWs
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return disconnected initially", () => {
    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
      })
    )

    expect(result.current.connectionState).toBe("disconnected")
  })

  it("should connect when connect() is called", () => {
    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
      })
    )

    act(() => {
      result.current.connect()
    })

    expect(result.current.connectionState).toBe("connecting")
  })

  it("should transition to connected on open", () => {
    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
      })
    )

    act(() => {
      result.current.connect()
      wsHelper.simulateOpen()
    })

    expect(result.current.connectionState).toBe("connected")
  })

  it("should provide sendInsert and sendDelete", () => {
    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
      })
    )

    act(() => {
      result.current.connect()
      wsHelper.simulateOpen()
      result.current.sendInsert(5, "Hello")
      result.current.sendDelete(0, 3)
    })

    expect(wsHelper.mockWs.send).toHaveBeenCalledTimes(2)
  })

  it("should update CollaborationStore when connected", () => {
    const setConnectionStatus = vi.fn()
    const setSessionId = vi.fn()
    const mockStore = {
      setConnectionStatus,
      setSessionId,
    } as unknown as import("@world-office/editor-stores").CollaborationStore

    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: mockStore,
      })
    )

    act(() => {
      result.current.connect()
      wsHelper.simulateOpen()
    })

    expect(setConnectionStatus).toHaveBeenCalledWith("connected")
  })

  it("should disconnect on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
      })
    )

    act(() => {
      result.current.connect()
      wsHelper.simulateOpen()
    })

    unmount()

    expect(wsHelper.mockWs.close).toHaveBeenCalled()
  })

  it("should call onRemoteOperation callback", () => {
    const onRemoteOp = vi.fn()
    const { result } = renderHook(() =>
      useCollaboration({
        wsUrl: "ws://localhost:8004/ws/test",
        userId: "u1",
        collaborationStore: null,
        onRemoteOperation: onRemoteOp,
      })
    )

    act(() => {
      result.current.connect()
      wsHelper.simulateOpen()
      wsHelper.simulateMessage(JSON.stringify({
        session_id: "test",
        user_id: "u2",
        revision: 0,
        type: "insert",
        position: 0,
        length: 0,
        content: "remote",
        timestamp: "2026-04-18T00:00:00+00:00",
      }))
    })

    expect(onRemoteOp).toHaveBeenCalledOnce()
    expect(onRemoteOp.mock.calls[0][0].user_id).toBe("u2")
  })
})