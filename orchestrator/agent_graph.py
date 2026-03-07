from langgraph.graph import StateGraph
from agents.claim_agent import extract_claim
from agents.evidence_agent import collect_evidence
from agents.credibility_agent import evaluate_sources
from agents.factcheck_agent import fact_check
from agents.verdict_agent import generate_verdict

def run_pipeline(user_input):

    claim = extract_claim(user_input)

    evidence = collect_evidence(claim)

    credibility = evaluate_sources(evidence)

    factchecks = fact_check(claim)

    verdict = generate_verdict(
        claim,
        evidence,
        credibility,
        factchecks
    )

    return verdict