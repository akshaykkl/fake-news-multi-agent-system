import { useEffect, useRef, useState } from "react"
import ClaimInput from "./components/ClaimInput"
import InvestigationLog from "./components/InvestigationLog"
import Verdict from "./components/Verdict"
import WorkflowGraph from "./components/WorkflowGraph"
import { connectToInvestigationStream } from "./services/api"
import type { StreamConnection } from "./services/api"
import type { StreamEvent, TimelineItem } from "./types"
import "./App.css"

function formatNodeLabel(node: string) {
  return node
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function buildTimelineItem(event: StreamEvent, index: number): TimelineItem {
  if (event.type === "status") {
    return {
      id: `status-${index}`,
      label: "Status",
      title: event.message,
      description: "The backend is preparing or progressing the investigation.",
      tone: "info",
    }
  }

  if (event.type === "memory_hit") {
    return {
      id: `memory-hit-${index}`,
      label: "Cache",
      title: "Previous investigation reused",
      description: `Loaded a stored verdict for "${event.data.claim}".`,
      tone: "success",
    }
  }

  const nodeSummary =
    event.state.verdict ||
    event.state.skeptic_argument ||
    event.state.investigator_argument ||
    `Iteration ${event.state.iteration ?? 0} completed.`

  return {
    id: `node-${event.node}-${index}`,
    label: "Agent",
    title: formatNodeLabel(event.node),
    description: nodeSummary,
    tone: event.state.verdict ? "success" : "info",
  }
}

function getActiveAgent(events: StreamEvent[], verdict: string | null, isStreaming: boolean) {
  if (verdict) {
    return "Verdict ready"
  }

  if (!isStreaming) {
    return "Waiting for a claim"
  }

  if (events.length === 0) {
    return "Connecting to backend"
  }

  const latest = events[events.length - 1]

  if (latest.type === "status") {
    return "Collecting evidence"
  }

  if (latest.type === "memory_hit") {
    return "Memory cache hit"
  }

  return formatNodeLabel(latest.node)
}

function getResearchRounds(events: StreamEvent[]) {
  return events.filter((event) => event.type === "node" && event.node === "research").length
}

function App() {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [verdict, setVerdict] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const connectionRef = useRef<StreamConnection | null>(null)

  const startInvestigation = (claim: string) => {
    connectionRef.current?.disconnect()
    setEvents([])
    setTimeline([])
    setVerdict(null)
    setError(null)
    setIsStreaming(true)

    connectionRef.current = connectToInvestigationStream(claim, {
      onEvent: (event) => {
        setEvents((prevEvents) => {
          const nextEvents = [...prevEvents, event]
          setTimeline(nextEvents.map(buildTimelineItem))
          return nextEvents
        })

        if (event.type === "memory_hit") {
          setVerdict(event.data.verdict)
          setIsStreaming(false)
          connectionRef.current?.disconnect()
          connectionRef.current = null
          return
        }

        if (event.type === "node" && event.state.verdict) {
          setVerdict(event.state.verdict)
          setIsStreaming(false)
          connectionRef.current?.disconnect()
          connectionRef.current = null
        }
      },
      onError: (message) => {
        setError(message)
        setIsStreaming(false)
        connectionRef.current = null
      },
    })
  }

  useEffect(() => {
    return () => {
      connectionRef.current?.disconnect()
      connectionRef.current = null
    }
  }, [])

  return (
    <div className="container">
      <header className="hero">
        <p className="eyebrow">Investigation Timeline</p>
        <h1>AI Fact-Checking Investigation</h1>
        <p className="subtitle">
          Submit a claim and follow each backend event as the system gathers evidence,
          reasons through it, and returns a verdict.
        </p>
      </header>

      <ClaimInput onSubmit={startInvestigation} disabled={isStreaming} />

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="overview-grid">
        <article className="overview-card">
          <span className="overview-label">Active Stage</span>
          <strong>{getActiveAgent(events, verdict, isStreaming)}</strong>
          <p>The current agent or system step leading the investigation.</p>
        </article>
        <article className="overview-card">
          <span className="overview-label">Events Captured</span>
          <strong>{events.length}</strong>
          <p>Every backend event is preserved and shown in the timeline below.</p>
        </article>
        <article className="overview-card">
          <span className="overview-label">Research Loops</span>
          <strong>{getResearchRounds(events)}</strong>
          <p>Extra research rounds requested by the skeptic agent.</p>
        </article>
      </section>

      <WorkflowGraph events={events} verdict={verdict} isStreaming={isStreaming} />

      <InvestigationLog events={events} items={timeline} isStreaming={isStreaming} />

      <Verdict verdict={verdict} />
    </div>
  )
}

export default App
