from models.llm import get_llm

llm = get_llm()


def skeptic_node(state):

    claim = state["claim"]
    investigator = state["investigator_argument"]
    evidence = state["evidence"]

    prompt = f"""
You are a skeptical fact checker.

Claim:
{claim}

Investigator argument:
{investigator}

Evidence:
{evidence}

Tasks:

1 Identify flaws in evidence
2 Decide if MORE RESEARCH is needed

Return:

Critique:
NeedMoreResearch: YES or NO
"""

    response = llm.invoke(prompt).content

    state["skeptic_argument"] = response

    if "YES" in response.upper():
        state["need_more_research"] = True
    else:
        state["need_more_research"] = False

    return state