from models.llm import get_llm
from agents.verdict_agent import format_evidence
llm = get_llm()


def investigator_node(state):

    claim = state["claim"]
    evidence_text = format_evidence(state["evidence"])
    fact_checks = state["fact_checks"]
    prompt = f"""
You are an investigative journalist.

Original claim:
{claim}

Evidence:
{evidence_text}

Fact-check database results:
{fact_checks}

Task:

1. Restate the claim exactly.
2. Compare the evidence directly against the claim.
3. Determine if the evidence SUPPORTS or CONTRADICTS the claim.

Rules:
- Do NOT rewrite the claim.
- Do NOT invert the claim.
- If evidence shows something different from the claim, say the claim is CONTRADICTED.

Return:

Analysis:
EvidenceSupports: YES or NO
"""

    response = llm.invoke(prompt)

    state["investigator_argument"] = response.content

    return state