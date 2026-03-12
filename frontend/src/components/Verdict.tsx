interface Props {
  verdict: string | null
}

export default function Verdict({ verdict }: Props) {
  if (!verdict) return null

  return (
    <div className="verdict">
      <h2>Final Verdict</h2>
      <pre>{verdict}</pre>
    </div>
  )
}
