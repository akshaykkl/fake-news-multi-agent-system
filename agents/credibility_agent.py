TRUSTED_DOMAINS = [
"bbc.com",
"reuters.com",
"apnews.com",
"who.int",
"nature.com",
"nytimes.com"
]

LOW_TRUST = [
"blogspot",
"wordpress",
"rumor",
"forum"
]
def check_source(url):

    for d in TRUSTED_DOMAINS:
        if d in url:
            return 0.9

    for d in LOW_TRUST:
        if d in url:
            return 0.2

    return 0.5

def evaluate_sources(articles):

    scores = []

    for article in articles:

        score = check_source(article["source"])

        scores.append({
            "source": article["source"],
            "credibility": score
        })

    return scores