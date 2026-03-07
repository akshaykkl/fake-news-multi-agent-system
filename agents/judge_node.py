from models.llm import get_llm

llm = get_llm()


def judge_node(state):

    claim = state["claim"]

    investigator = state["investigator_argument"]

    skeptic = state["skeptic_argument"]

    prompt = f"""
You are the final judge.

Claim:
{claim}

Investigator:
{investigator}

Skeptic:
{skeptic}

Return:

Verdict
Confidence
Explanation
"""

    response = llm.invoke(prompt)

    state["verdict"] = response.content

    return state