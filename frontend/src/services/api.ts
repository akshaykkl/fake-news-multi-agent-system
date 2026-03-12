import type {
  MemoryHitData,
  NodeState,
  StreamEvent,
} from "../types"

interface StreamCallbacks {
  onEvent: (event: StreamEvent) => void
  onError?: (message: string) => void
}

export interface StreamConnection {
  disconnect: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseMemoryHitData(value: unknown): MemoryHitData | null {
  if (!isRecord(value) || typeof value.claim !== "string" || typeof value.verdict !== "string") {
    return null
  }

  return value as MemoryHitData
}

function parseNodeState(value: unknown): NodeState | null {
  if (!isRecord(value)) {
    return null
  }

  return value as NodeState
}

function parseStreamEvent(raw: string): StreamEvent | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed) || typeof parsed.type !== "string") {
    return null
  }

  if (parsed.type === "status" && typeof parsed.message === "string") {
    return {
      type: "status",
      message: parsed.message,
    }
  }

  if (parsed.type === "memory_hit") {
    const data = parseMemoryHitData(parsed.data)

    if (!data) {
      return null
    }

    return {
      type: "memory_hit",
      data,
    }
  }

  if (parsed.type === "node" && typeof parsed.node === "string") {
    const state = parseNodeState(parsed.state)

    if (!state) {
      return null
    }

    return {
      type: "node",
      node: parsed.node,
      state,
    }
  }

  return null
}

export function connectToInvestigationStream(
  claim: string,
  callbacks: StreamCallbacks,
): StreamConnection {
  const source = new EventSource(`/api/stream/?claim=${encodeURIComponent(claim)}`)
  let closed = false

  const disconnect = () => {
    if (closed) {
      return
    }

    closed = true
    source.close()
  }

  source.onmessage = (event) => {
    const parsedEvent = parseStreamEvent(event.data)

    if (!parsedEvent) {
      callbacks.onError?.("Received an unexpected response from the backend stream.")
      disconnect()
      return
    }

    callbacks.onEvent(parsedEvent)
  }

  source.onerror = () => {
    callbacks.onError?.("The investigation stream disconnected before finishing.")
    disconnect()
  }

  return { disconnect }
}
