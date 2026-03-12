import type { StreamEvent, TimelineItem } from "../types"

interface Props {
  events: StreamEvent[]
  items: TimelineItem[]
  isStreaming: boolean
}

function getEventDetails(event: StreamEvent): string | null {
  if (event.type === "memory_hit") {
    return event.data.verdict
  }

  if (event.type === "node") {
    if (Array.isArray(event.state.fact_checks) && event.state.fact_checks.length > 0) {
      return `Fact checks found: ${event.state.fact_checks.length}`
    }

    if (typeof event.state.need_more_research === "boolean") {
      return event.state.need_more_research
        ? "The workflow requested another research round."
        : "The workflow advanced without another research round."
    }
  }

  return null
}

export default function InvestigationLog({ events, items, isStreaming }: Props) {
  return (
    <div className="log">
      <h2>Agent Activity</h2>

      {items.length === 0 ? (
        <div className="log-empty">
          {isStreaming ? "Waiting for the first backend event..." : "No investigation has started yet."}
        </div>
      ) : (
        items.map((item, index) => {
          const details = getEventDetails(events[index])

          return (
            <article key={item.id} className={`log-item tone-${item.tone}`}>
              <div className="log-header">
                <span className="step">{item.label}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.description}</p>
              {details ? <pre className="log-detail">{details}</pre> : null}
            </article>
          )
        })
      )}
    </div>
  )
}
