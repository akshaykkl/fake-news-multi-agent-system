from langgraph.graph import StateGraph, END

from orchestrator.state import AgentState

from agents.factcheck_node import factcheck_node
from agents.investigator_node import investigator_node
from agents.skeptic_node import skeptic_node
from agents.judge_node import judge_node
from agents.research_node import research_node
from agents.claim_agent import extract_claim
from agents.evidence_agent import collect_evidence

def decide_next(state):

    if state["need_more_research"] and state["iteration"] < 2:
        return "research"

    return "judge"

def run_pipeline(user_input):

    claim = extract_claim(user_input)

    evidence = collect_evidence(claim)

    initial_state = {
    "claim": claim,
    "evidence": evidence,
    "fact_checks": [],
    "investigator_argument": "",
    "skeptic_argument": "",
    "verdict": "",
    "need_more_research": False,
    "iteration": 0
    }

    workflow = StateGraph(AgentState)

    workflow.add_node("investigator", investigator_node)
    workflow.add_node("factcheck", factcheck_node)
    workflow.add_node("skeptic", skeptic_node)
    workflow.add_node("research", research_node)
    workflow.add_node("judge", judge_node)

    workflow.set_entry_point("factcheck")

    workflow.add_edge("factcheck", "investigator")

    # MISSING EDGE (ADD THIS)
    workflow.add_edge("investigator", "skeptic")

    workflow.add_conditional_edges(
        "skeptic",
        decide_next,
        {
            "research": "research",
            "judge": "judge"
        }
    )

    workflow.add_edge("research", "investigator")

    workflow.add_edge("judge", END)

    # IMPORTANT PART
    app = workflow.compile()

    result = app.invoke(initial_state)

    print("\n--- Investigator ---")
    print(result["investigator_argument"])

    print("\n--- Skeptic ---")
    print(result["skeptic_argument"])

    print("\n--- Verdict ---")
    print(result["verdict"])

    return result["verdict"]