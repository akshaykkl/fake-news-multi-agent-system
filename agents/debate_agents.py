from models.llm import get_llm

llm = get_llm()


def investigator_agent(claim, evidence):

    prompt = f"""
You are an investigative journalist.

Claim:
{claim}

Evidence:
{evidence}

Your job:
Argue whether the claim could be TRUE based on the evidence.
Present supporting arguments.
"""

    response = llm.invoke(prompt)

    return response.content

def skeptic_agent(claim, investigator_argument, evidence):

    prompt = f"""
You are a skeptical fact checker.

Claim:
{claim}

Investigator's argument:
{investigator_argument}

Evidence:
{evidence}

Your job:
Identify flaws, weak sources, and misinformation.
Explain why the claim might be false.
"""

    response = llm.invoke(prompt)

    return response.content

def judge_agent(claim, investigator_argument, skeptic_argument):

    prompt = f"""
You are the final judge in a fact-checking system.

Claim:
{claim}

Investigator argument:
{investigator_argument}

Skeptic argument:
{skeptic_argument}

Decide:

1 Verdict: True / False / Misleading
2 Confidence score
3 Final explanation
"""

    response = llm.invoke(prompt)

    return response.content