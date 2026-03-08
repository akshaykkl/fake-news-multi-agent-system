from models.llm import get_llm
from agents.evidence_agent import collect_evidence

llm = get_llm()

def research_node(state):

    claim = state["claim"]
    critique = state["skeptic_argument"]

    prompt = f"""
Generate a better web search query to investigate this claim.

Claim:
{claim}

Critique:
{critique}

Return only the improved search query.
"""

    query = llm.invoke(prompt).content.strip()

    new_evidence = collect_evidence(query)

    existing = {e["source"] for e in state["evidence"]}

    for e in new_evidence:
        if e["source"] not in existing:
            state["evidence"].append(e)

    state["iteration"] += 1

    return state