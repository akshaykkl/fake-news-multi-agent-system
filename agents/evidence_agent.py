from tools.web_search import search_web
from tools.web_scraper import get_article_text
from models.llm import get_llm

llm = get_llm()

def summarize_article(text):

    prompt = f"""
Summarize the following article in 3 sentences.

Article:
{text}
"""

    response = llm.invoke(prompt)

    return response.content.strip()

def collect_evidence(claim):

    results = search_web(claim)
    print("Search results:", results)
    articles = []

    for r in results:

        url = r["url"]   # FIX HERE
        
        text = get_article_text(url)

        if text and len(text) > 200:

            summary = summarize_article(text[:2000])

            articles.append({
                "source": url,
                "summary": summary
            })

    return articles