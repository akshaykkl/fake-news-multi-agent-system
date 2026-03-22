from langgraph.graph import StateGraph, END

from orchestrator.state import AgentState

from memory.faiss_memory import search_memory, add_memory

from agents.factcheck_node import factcheck_node
from agents.investigator_node import investigator_node
from agents.skeptic_node import skeptic_node
from agents.judge_node import judge_node
from agents.research_node import research_node
from agents.claim_agent import extract_claim
from agents.evidence_agent import collect_evidence

def decide_next(state):
    print(f"\n[DEBUG] decide_next called.")
    print(f"[DEBUG] state['need_more_research']: {state.get('need_more_research')}")
    print(f"[DEBUG] state['iteration']: {state.get('iteration')}")

    if state["need_more_research"] and state["iteration"] < 5:
        print("[DEBUG] Routing to: research")
        return "research"

    print("[DEBUG] Routing to: judge")
    return "judge"

def run_pipeline_stream(user_input):
    cached = search_memory(user_input)

    if cached:
        print("this is a match")
        yield {
            "type": "memory_hit",
            "data": cached
        }
        
        yield {
            "type": "final_verdict",
            "verdict": cached["verdict"],
            "sources": cached.get("sources", [])
        }

        return
    
    claim = extract_claim(user_input)

    yield {"type": "status", "message": "Collecting evidence"}

    evidence = collect_evidence(claim)
    sources = list(set([e["source"] for e in evidence]))

    initial_state = {
    "claim": claim,
    "evidence": evidence,
    "sources": sources,
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

    final_state = None

    for event in app.stream(initial_state):

        node = list(event.keys())[0]
        state = event[node]
        
        print(f"\n[DEBUG] Node executed: {node}")
        print(f"[DEBUG] need_more_research is now: {state.get('need_more_research')}")
        if node == "skeptic":
            print(f"[DEBUG] Skeptic argument snippet: {state.get('skeptic_argument', '')[:100]}...")

        # Extract sources from state if the evidence list changed (e.g., after research loop)
        if "evidence" in state:
            state["sources"] = list(set([e["source"] for e in state["evidence"]]))

        yield {
            "type": "node",
            "node": node,
            "state": state
        }

        # capture final judge state
        if node == "judge":
            final_state = state




    if final_state:

        verdict_raw = final_state.get("verdict", "")
        sources = final_state.get("sources", [])

        
        
        confidence = None
        explanation = None
        clean_verdict = verdict_raw
        
        lines = verdict_raw.split('\n')
        for line in lines:
            if line.startswith('Verdict:'):
                 clean_verdict = line.replace('Verdict:', '').split()[0]
            elif line.startswith('Confidence:'):
                try:
                    confidence = float(line.replace('Confidence:', '').strip())
                except ValueError:
                    pass
            elif line.startswith('Explanation:'):
                explanation = line.replace('Explanation:', '').strip()
                # If there are subsequent lines in the explanation, we want to capture those too 
                # (but based on the simple split, we'll just take the rest of the string after explanation)
                exp_start = verdict_raw.find('Explanation:')
                if exp_start != -1:
                    explanation = verdict_raw[exp_start + len('Explanation:'):].strip()

        add_memory(claim, clean_verdict, confidence=confidence, sources=sources, explanation=explanation)

        yield {
            "type": "final_verdict",
            "verdict": verdict_raw,
            "sources": sources
        }
    
    # return result["verdict"]