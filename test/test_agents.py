import pytest
import asyncio

from agents.video_agent import VideoAgent
from agents.audio_agent import AudioAgent
from agents.metadata_agent import MetadataAgent
from agents.storyboard_agent import StoryboardAgent

@pytest.mark.asyncio
async def test_video_agent():
    agent = VideoAgent(job_id="test-job", file_path="test_video.mp4")
    result = await agent.process()
    assert "resolution" in result
    assert result["frames_processed"] > 0

@pytest.mark.asyncio
async def test_audio_agent():
    agent = AudioAgent(job_id="test-job", file_path="test_audio.wav")
    result = await agent.process()
    assert "speech_to_text" in result
    assert result["quality"].startswith("48kHz")

@pytest.mark.asyncio
async def test_metadata_agent():
    agent = MetadataAgent(job_id="test-job", file_path="test_image.jpg", file_type="image/jpeg")
    result = await agent.process()
    assert "llm_summary" in result
    assert isinstance(result["tags"], list)

@pytest.mark.asyncio
async def test_storyboard_agent():
    agent = StoryboardAgent(job_id="test-job", file_path="test_video.mp4")
    result = await agent.process()
    assert result["timeline_generated"] is True
    assert result["key_frames"] > 0
