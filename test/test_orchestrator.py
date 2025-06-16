import pytest
import asyncio

from orchestrator.agent_orchestrator import AgentOrchestrator

@pytest.mark.asyncio
async def test_orchestrator_pipeline():
    orchestrator = AgentOrchestrator()
    job_id = await orchestrator.process_file("demo.mp4", "video/mp4")

    assert job_id in orchestrator.jobs
    job = orchestrator.jobs[job_id]
    assert job["status"] == "completed"
    assert "video-agent" in job["results"]
    assert "metadata-agent" in job["results"]
    assert "audio-agent" in job["results"]
    assert "storyboard-agent" in job["results"]

    assert len(orchestrator.messages) >= 8  # 4 requests + 4 responses
