from models.llm import get_llm

llm = get_llm()


def skeptic_node(state):

    claim = state["claim"]
    investigator = state["investigator_argument"]
    evidence = state["evidence"]
    fact_checks = state["fact_checks"]

    prompt = f"""
You are a skeptical fact checker.

Claim:
{claim}

Investigator argument:
{investigator}

Evidence:
{evidence}

Fact check results:
{fact_checks}

Critique the investigator's reasoning and identify weaknesses.

Return:

Critique:
NeedMoreResearch: YES or NO
"""

    response = llm.invoke(prompt).content

    state["skeptic_argument"] = response

    if "NEEDMORESEARCH: YES" in response.upper():
        state["need_more_research"] = True
    else:
        state["need_more_research"] = False

    return state