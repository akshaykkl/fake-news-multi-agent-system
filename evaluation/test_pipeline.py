from orchestrator.agent_graph import run_pipeline

if __name__ == "__main__":

    claim = input("Enter a claim to investigate: ")

    result = run_pipeline(claim)

    print("\n===== INVESTIGATION RESULT =====\n")
    print(result)