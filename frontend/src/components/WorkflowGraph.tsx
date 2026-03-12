import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "reactflow"
import type { CSSProperties } from "react"
import type { StreamEvent } from "../types"
import "reactflow/dist/style.css"

interface Props {
  events: StreamEvent[]
  verdict: string | null
  isStreaming: boolean
}

type StageStatus = "idle" | "active" | "completed"

interface StageMeta {
  title: string
  description: string
  position: { x: number; y: number }
}

const stageLayout: Record<string, StageMeta> = {
  memory: {
    title: "Memory Cache",
    description: "Reuses a previous verdict when the claim was already investigated.",
    position: { x: 20, y: 90 },
  },
  status: {
    title: "Evidence Intake",
    description: "Starts the live investigation and collects initial evidence.",
    position: { x: 260, y: 30 },
  },
  factcheck: {
    title: "Fact Check Agent",
    description: "Pulls direct claim-review signals and structured fact-checks.",
    position: { x: 520, y: 20 },
  },
  investigator: {
    title: "Investigator Agent",
    description: "Builds the main argument from gathered evidence.",
    position: { x: 820, y: 20 },
  },
  skeptic: {
    title: "Skeptic Agent",
    description: "Challenges the current case and decides if more research is needed.",
    position: { x: 1120, y: 20 },
  },
  research: {
    title: "Research Loop",
    description: "Runs another search cycle when the skeptic requests more evidence.",
    position: { x: 970, y: 240 },
  },
  judge: {
    title: "Judge Agent",
    description: "Produces the final verdict from the competing arguments.",
    position: { x: 1410, y: 20 },
  },
  verdict: {
    title: "Verdict",
    description: "The final conclusion shown to the user.",
    position: { x: 1680, y: 90 },
  },
}

function getActiveStage(events: StreamEvent[], verdict: string | null, isStreaming: boolean) {
  if (verdict) {
    return "verdict"
  }

  if (!isStreaming || events.length === 0) {
    return null
  }

  const lastEvent = events[events.length - 1]

  if (lastEvent.type === "memory_hit") {
    return "memory"
  }

  if (lastEvent.type === "status") {
    return "status"
  }

  return lastEvent.node
}

function buildStageStatuses(events: StreamEvent[], verdict: string | null, isStreaming: boolean) {
  const statuses: Record<string, StageStatus> = {
    memory: "idle",
    status: "idle",
    factcheck: "idle",
    investigator: "idle",
    skeptic: "idle",
    research: "idle",
    judge: "idle",
    verdict: "idle",
  }

  for (const event of events) {
    if (event.type === "status") {
      statuses.status = "completed"
      continue
    }

    if (event.type === "memory_hit") {
      statuses.memory = "completed"
      statuses.verdict = "completed"
      continue
    }

    statuses[event.node] = "completed"
    if (event.state.verdict) {
      statuses.judge = "completed"
      statuses.verdict = "completed"
    }
  }

  const activeStage = getActiveStage(events, verdict, isStreaming)

  if (activeStage && statuses[activeStage] !== "completed") {
    statuses[activeStage] = "active"
  }

  if (verdict && statuses.verdict !== "completed") {
    statuses.verdict = "completed"
  }

  return statuses
}

function getNodeStyle(status: StageStatus): CSSProperties {
  if (status === "completed") {
    return {
      background: "linear-gradient(160deg, rgba(14, 116, 144, 0.92), rgba(5, 46, 22, 0.92))",
      border: "1px solid rgba(134, 239, 172, 0.55)",
      boxShadow: "0 18px 38px rgba(22, 101, 52, 0.28)",
    }
  }

  if (status === "active") {
    return {
      background: "linear-gradient(160deg, rgba(30, 41, 59, 0.98), rgba(30, 64, 175, 0.92))",
      border: "1px solid rgba(125, 211, 252, 0.72)",
      boxShadow: "0 20px 40px rgba(37, 99, 235, 0.35)",
    }
  }

  return {
    background: "linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.82))",
    border: "1px solid rgba(51, 65, 85, 0.9)",
    boxShadow: "0 14px 34px rgba(2, 6, 23, 0.36)",
  }
}

function buildNodes(statuses: Record<string, StageStatus>): Node[] {
  return Object.entries(stageLayout).map(([id, meta]) => ({
    id,
    type: "default",
    position: meta.position,
    draggable: false,
    selectable: false,
    connectable: false,
    data: {
      label: (
        <div className="workflow-node">
          <span className={`workflow-pill stage-${statuses[id]}`}>{statuses[id]}</span>
          <strong>{meta.title}</strong>
          <p>{meta.description}</p>
        </div>
      ),
    },
    style: {
      width: 220,
      borderRadius: 22,
      color: "#e2e8f0",
      padding: 0,
      ...getNodeStyle(statuses[id]),
    },
  }))
}

function buildEdges(statuses: Record<string, StageStatus>): Edge[] {
  const highlighted = Object.values(statuses).includes("active")

  return [
    ["memory", "verdict", "direct-hit"],
    ["status", "factcheck", "ingest"],
    ["factcheck", "investigator", "factcheck-investigator"],
    ["investigator", "skeptic", "investigator-skeptic"],
    ["skeptic", "research", "skeptic-research"],
    ["research", "investigator", "research-investigator"],
    ["skeptic", "judge", "skeptic-judge"],
    ["judge", "verdict", "judge-verdict"],
  ].map(([source, target, id]) => ({
    id,
    source,
    target,
    animated:
      statuses[source] === "active" ||
      statuses[target] === "active" ||
      (highlighted && statuses[source] === "completed" && statuses[target] === "completed"),
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#38bdf8",
    },
    style: {
      stroke: "#38bdf8",
      strokeOpacity: statuses[source] === "idle" && statuses[target] === "idle" ? 0.35 : 0.9,
      strokeWidth: 2.2,
    },
  }))
}

export default function WorkflowGraph({ events, verdict, isStreaming }: Props) {
  const statuses = buildStageStatuses(events, verdict, isStreaming)
  const nodes = buildNodes(statuses)
  const edges = buildEdges(statuses)

  return (
    <section className="workflow-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Workflow View</p>
          <h2>Agent Pipeline Map</h2>
        </div>
        <p className="panel-copy">
          Each block reflects the live backend workflow. Active stages glow, completed
          stages lock in, and the research loop lights up only when the skeptic asks for more evidence.
        </p>
      </div>

      <div className="workflow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(56, 189, 248, 0.16)" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  )
}
