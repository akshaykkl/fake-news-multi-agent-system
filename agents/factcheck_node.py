from agents.fact_check_agent import fact_check, extract_fact_results

def factcheck_node(state):

    claim = state["claim"]

    data = fact_check(claim)

    results = extract_fact_results(data)

    state["fact_checks"] = results

    return state