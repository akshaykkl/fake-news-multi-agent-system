from models.llm import get_llm

llm = get_llm()

def format_evidence(evidence):

    formatted = ""

    for e in evidence:

        formatted += f"""
Source: {e['source']}
Summary: {e['summary']}
"""

    return formatted

def generate_verdict(claim, evidence, credibility, factchecks):

    evidence_text = format_evidence(evidence)

    prompt = f"""
You are a professional fact-checking analyst.

Claim:
{claim}

Evidence from news sources:
{evidence_text}

Source credibility scores:
{credibility}

Fact check database results:
{factchecks}

Determine:

Return exactly in this format:

Verdict: TRUE or FALSE or INCONCLUSIVE
Confidence: 0.0-1.0
Explanation: 1-2 sentences
"""

    response = llm.invoke(prompt)

    return response.content