from models.llm import get_llm

llm = get_llm()

def extract_claim(text):

    prompt = f"""
Extract the main factual claim from the text.

Text:
{text}

Return only the claim.
"""

    response = llm.invoke(prompt)

    return response.content.strip()