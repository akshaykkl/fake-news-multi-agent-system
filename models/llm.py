from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

# Load and access environment variables
load_dotenv()
groq_key = os.getenv("GROQ_KEY")

def get_llm():

    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=groq_key,
        temperature=0.2
    )

    return llm