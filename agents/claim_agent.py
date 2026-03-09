from models.llm import get_llm

llm = get_llm()

def extract_claim(text):

#     prompt = f"""
# Convert the user statement into a clear factual claim
# without changing its meaning.

# User statement:
# {text}

# Never rewrite, invert, or change the meaning of the claim.
# Rewrite only for grammar clarity.
# Do NOT change meaning.
# Do NOT infer missing information.
# Return ONLY the claim sentence.
# Do not explain.
# """

#     response = llm.invoke(prompt)

    return text.strip()