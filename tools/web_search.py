from ddgs import DDGS
BLOCKED_DOMAINS = [
"quora.com",
"scribd.com",
"forum",
"blogspot",
"wordpress"
]

TRUSTED_DOMAINS = [
"wikipedia.org",
"bbc.com",
"reuters.com",
"apnews.com",
"who.int",
"gov.in",
"edu"
]
def search_web(query, max_results=5):
    
    results = []

    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):

            url = r.get("href")
            title = r.get("title")

            if not url:
                continue
            if any(b in url for b in BLOCKED_DOMAINS):
                continue
            results.append({
                "title": title,
                "url": url
            })

    return results