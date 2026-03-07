from models.llm import get_llm

llm = get_llm()

def extract_claim(text):

    prompt = f"""
Rewrite the user statement into a precise factual claim.

User statement:
{text}

Make the claim specific and verifiable.
"""

    response = llm.invoke(prompt)

    return response.content.strip()