from newspaper import Article

def get_article_text(url):

    try:
        article = Article(url)
        article.download()
        article.parse()

        return article.text

    except:
        return ""