import { useState } from "react"

interface Props {
  onSubmit: (claim: string) => void
  disabled?: boolean
}

export default function ClaimInput({ onSubmit, disabled = false }: Props) {
  const [claim, setClaim] = useState("")

  const handleSubmit = () => {
    const nextClaim = claim.trim()

    if (!nextClaim || disabled) {
      return
    }

    onSubmit(nextClaim)
  }

  return (
    <div className="claim-box">
      <input
        type="text"
        placeholder="Enter a claim..."
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit()
          }
        }}
        disabled={disabled}
      />

      <button onClick={handleSubmit} disabled={disabled}>
        {disabled ? "Investigating..." : "Investigate"}
      </button>
    </div>
  )
}
