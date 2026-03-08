from models.llm import get_llm

llm = get_llm()

def extract_claim(text):

    prompt = f"""
Convert the user statement into a clear factual claim
without changing its meaning.

User statement:
{text}

Never rewrite, invert, or change the meaning of the claim.
"""

    response = llm.invoke(prompt)

    return response.content.strip()