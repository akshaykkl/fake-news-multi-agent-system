import "./Verdict.css"

interface Props {
  verdict: string | null
  sources?: string[] | null
}

export default function Verdict({ verdict, sources }: Props) {
  if (!verdict) return null

  // Determine outcome for dynamic styling
  const isFake = verdict.toLowerCase().includes("fake") || verdict.toLowerCase().includes("false")
  const isTrue = verdict.toLowerCase().includes("true") || verdict.toLowerCase().includes("verified")
  
  let outcomeClass = "verdict-neutral"
  if (isFake) outcomeClass = "verdict-fake"
  else if (isTrue) outcomeClass = "verdict-true"

  return (
    <div className={`verdict-container ${outcomeClass}`}>
      <div className="verdict-header">
        <h2>Final Verdict</h2>
        <span className="verdict-badge">Decision Reached</span>
      </div>
      
      <div className="verdict-content">
        <pre>{verdict}</pre>
      </div>
      
      {sources && sources.length > 0 && (
        <div className="verdict-sources">
          <h3>Evidence Sources</h3>
          <ul className="source-list">
            {sources.map((url, i) => {
              let domain = url
              try {
                domain = new URL(url).hostname.replace('www.', '')
              } catch(e) {}
              return (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {domain}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
