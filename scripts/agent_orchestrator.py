from lib.llm import run_llm  # new import

# inside simulate_agent_processing
if agent.type == "metadata":
    prompt = f"Extract metadata from a {file_type} file named '{agent.current_job}'."
    llm_output = run_llm(prompt)
    return {
        "llm_summary": llm_output,
        "tags": ["action", "outdoor", "daylight"],
        "sentiment": "Positive"
    }
