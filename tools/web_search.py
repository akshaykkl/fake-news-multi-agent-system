from ddgs import DDGS

def search_web(query, max_results=5):

    results = []

    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):

            url = r.get("href")
            title = r.get("title")

            if not url:
                continue

            results.append({
                "title": title,
                "url": url
            })

    return results