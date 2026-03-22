export interface MemoryHitData {
  claim: string
  verdict: string
  confidence?: number | null
  sources?: unknown[] | null
  explanation?: string | null
  [key: string]: unknown
}

export interface NodeState {
  claim?: string
  evidence?: unknown
  fact_checks?: unknown[]
  investigator_argument?: string
  skeptic_argument?: string
  verdict?: string
  need_more_research?: boolean
  iteration?: number
  [key: string]: unknown
}

export interface StatusEvent {
  type: "status"
  message: string
}

export interface MemoryHitEvent {
  type: "memory_hit"
  data: MemoryHitData
}

export interface NodeEvent {
  type: "node"
  node: string
  state: NodeState
}

export type StreamEvent = StatusEvent | MemoryHitEvent | NodeEvent

export interface TimelineItem {
  id: string
  label: string
  title: string
  description: string
  tone: "info" | "success" | "warning"
}
