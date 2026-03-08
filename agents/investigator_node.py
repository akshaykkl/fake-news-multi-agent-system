from models.llm import get_llm

llm = get_llm()


def investigator_node(state):

    claim = state["claim"]
    evidence = state["evidence"]
    fact_checks = state["fact_checks"]
    prompt = f"""
You are an investigative journalist.

Original claim:
{claim}

Evidence:
{evidence}


Fact-check database results:
{fact_checks}

Your task:
Analyze whether the evidence SUPPORTS or CONTRADICTS the claim.

Important rules:
- Do NOT rewrite the claim.
- Do NOT invert the claim.
- Always evaluate the original claim exactly as written.

Explain whether the evidence supports or contradicts the claim.
"""

    response = llm.invoke(prompt)

    state["investigator_argument"] = response.content

    return state