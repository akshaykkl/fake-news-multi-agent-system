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

Your goal is to critique the investigator's reasoning and decide if the current evidence is sufficient to make a sound True/False judgment.
If the evidence already directly supports or directly contradicts the claim with reliable information, you MUST conclude the investigation.

RULES:
- Do NOT request more research if the current evidence is already sufficient to debunk or verify the claim.
- Do NOT request more research just to "be absolutely sure" or "check more edge cases" if the primary sources already provide a clear answer.
- Only output NeedMoreResearch: YES if the evidence is completely missing, completely contradictory amongst itself, or fundamentally fails to address the core claim.

Return:

Critique: [Your short critique]
NeedMoreResearch: YES or NO
"""

    response = llm.invoke(prompt).content

    state["skeptic_argument"] = response

    if "NEEDMORERESEARCH: YES" in response.upper():
        state["need_more_research"] = True
    else:
        state["need_more_research"] = False

    return state