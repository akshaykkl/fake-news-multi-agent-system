import requests
import os
from dotenv import load_dotenv

# Load and access environment variables
load_dotenv(dotenv_path='.env')
google_key = os.getenv("GOOGLE_KEY")


def fact_check(claim):

    url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={claim}&key={google_key}"

    r = requests.get(url).json()

    return r

def extract_fact_results(data):

    results = []

    if "claims" not in data:
        return results

    for claim in data["claims"]:

        review = claim["claimReview"][0]

        results.append({
            "publisher": review["publisher"]["name"],
            "rating": review["textualRating"]
        })

    return results