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
  claim: string
  events: StreamEvent[]
  sources: string[]
  verdict: string | null
  isStreaming: boolean
}

function getNodeStyle(type: 'claim' | 'source' | 'verdict', isActive: boolean): CSSProperties {
  const baseStyle: CSSProperties = {
    width: 240,
    borderRadius: 16,
    color: "#e2e8f0",
    padding: '16px',
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '1.4',
  }

  if (type === 'claim') {
    return {
      ...baseStyle,
      background: isActive ? "linear-gradient(160deg, rgba(30, 41, 59, 0.98), rgba(30, 64, 175, 0.92))" : "linear-gradient(160deg, rgba(14, 116, 144, 0.92), rgba(5, 46, 22, 0.92))",
      border: isActive ? "1px solid rgba(125, 211, 252, 0.72)" : "1px solid rgba(134, 239, 172, 0.55)",
      boxShadow: isActive ? "0 20px 40px rgba(37, 99, 235, 0.35)" : "0 18px 38px rgba(22, 101, 52, 0.28)",
    }
  }

  if (type === 'verdict') {
    return {
      ...baseStyle,
      background: "linear-gradient(160deg, rgba(30, 41, 59, 0.95), rgba(76, 29, 149, 0.6))",
      border: "1px solid rgba(167, 139, 250, 0.7)",
      boxShadow: "0 14px 34px rgba(139, 92, 246, 0.25)",
      fontWeight: 'bold',
      fontSize: '16px'
    }
  }

  // Source nodes
  return {
    ...baseStyle,
    background: "linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))",
    border: "1px solid rgba(71, 85, 105, 0.8)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
    fontSize: '12px',
    padding: '12px'
  }
}

export default function WorkflowGraph({ claim, events, sources, verdict, isStreaming }: Props) {
  
  if (!claim && events.length === 0 && !verdict) {
      return (
          <section className="workflow-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Evidence Map</p>
                <h2>Investigation Flow</h2>
              </div>
              <p className="panel-copy">
                Submit a claim to see the evidence generated and linked to the final verdict.
              </p>
            </div>
            <div className="workflow-canvas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Waiting for investigation...</p>
            </div>
          </section>
      )
  }

  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // 1. Claim Node (Root)
  nodes.push({
    id: "claim",
    type: "default",
    position: { x: 400, y: 50 },
    draggable: false,
    selectable: false,
    connectable: false,
    data: {
      label: (
        <div>
          <strong style={{ color: '#bae6fd', display: 'block', marginBottom: '8px' }}>CLAIM</strong>
          <span>"{claim || 'Unknown claim'}"</span>
        </div>
      )
    },
    style: getNodeStyle('claim', isStreaming && !verdict)
  })

  // 2. Source Nodes
  const numSources = sources.length
  
  sources.forEach((source, index) => {
    
    // Spread sources out horizontally
    const spacing = 280
    const startX = 400 - ((numSources - 1) * spacing) / 2
    const xPos = startX + (index * spacing)
    
    let domain = source
    try {
        domain = new URL(source).hostname.replace('www.', '')
    } catch(e) {}

    const nodeId = `source-${index}`
    nodes.push({
      id: nodeId,
      type: "default",
      position: { x: xPos, y: 220 },
      draggable: false,
      selectable: false,
      connectable: false,
      data: {
        label: (
          <div>
            <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>EVIDENCE SOURCE</strong>
            <span style={{ wordBreak: 'break-all' }}>{domain}</span>
          </div>
        )
      },
      style: getNodeStyle('source', false)
    })

    edges.push({
      id: `edge-claim-${nodeId}`,
      source: "claim",
      target: nodeId,
      animated: isStreaming && !verdict,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
      style: { stroke: "#64748b", strokeWidth: 1.5, strokeDasharray: isStreaming ? '4 4' : 'none' },
    })
  })

  // 3. Verdict Node
  if (verdict) {
      nodes.push({
        id: "verdict",
        type: "default",
        position: { x: 400, y: 400 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          label: (
            <div>
              <strong style={{ color: '#ddd6fe', display: 'block', marginBottom: '8px' }}>FINAL VERDICT</strong>
              <span>Decision Reached</span>
            </div>
          )
        },
        style: getNodeStyle('verdict', false)
      })

      // Link all sources to verdict OR link claim directly if no sources
      if (sources.length > 0) {
          sources.forEach((_, index) => {
              const sourceId = `source-${index}`
              edges.push({
                id: `edge-${sourceId}-verdict`,
                source: sourceId,
                target: "verdict",
                animated: false,
                markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
                style: { stroke: "#8b5cf6", strokeWidth: 2 },
              })
          })
      } else {
          edges.push({
            id: `edge-claim-verdict`,
            source: "claim",
            target: "verdict",
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          })
      }
  }

  return (
    <section className="workflow-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Evidence Map</p>
          <h2>Investigation Flow</h2>
        </div>
        <p className="panel-copy">
          Visualizing the relationship between the submitted claim, the gathered evidence sources, and the final verdict.
        </p>
      </div>

      <div className="workflow-canvas" style={{ minHeight: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnDrag={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(56, 189, 248, 0.16)" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  )
}
