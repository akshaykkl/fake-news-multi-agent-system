from models.llm import get_llm

llm = get_llm()


def judge_node(state):

    claim = state["claim"]
    investigator = state["investigator_argument"]
    skeptic = state["skeptic_argument"]
    evidence = state["evidence"]
    fact_checks = state["fact_checks"]

    prompt = f"""
You are the final judge in a fact-checking system.

Original claim:
{claim}

Evidence:
{evidence}

Investigator analysis:
{investigator}

Fact-check database results:
{fact_checks}

Skeptic critique:
{skeptic}

Your task:
Determine whether the ORIGINAL claim is correct.

Rules:
- Compare the evidence directly against the claim.
- If the evidence contradicts the claim, the verdict MUST be FALSE.

Return exactly:

Verdict: TRUE / FALSE / INCONCLUSIVE
Confidence: number between 0 and 1
Explanation: short reasoning evaluating the original claim.
"""

    response = llm.invoke(prompt).content

    state["verdict"] = response

    return state