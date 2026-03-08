from typing import TypedDict, List

class AgentState(TypedDict):

    claim: str
    evidence: List

    investigator_argument: str
    skeptic_argument: str

    fact_checks: List

    verdict: str

    need_more_research: bool
    iteration: int