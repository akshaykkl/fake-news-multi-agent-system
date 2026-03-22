from newspaper import Article

def get_article_text(url):
    print("Scraping:", url)
    try:
        article = Article(url)
        article.download()
        article.parse()

        return article.text

    except Exception as e:
        print("Scraper error:", url, e)
        return ""