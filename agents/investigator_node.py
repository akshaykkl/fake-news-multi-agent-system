from models.llm import get_llm

llm = get_llm()


def investigator_node(state):

    claim = state["claim"]
    evidence = state["evidence"]

    prompt = f"""
You are an investigative journalist.

Claim:
{claim}

Evidence:
{evidence}

Argue why the claim might be TRUE.
"""

    response = llm.invoke(prompt)

    state["investigator_argument"] = response.content

    return state