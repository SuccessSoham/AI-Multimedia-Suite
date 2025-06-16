from typing import Dict, Type
from agents.video_agent import VideoAgent
from agents.audio_agent import AudioAgent
from agents.metadata_agent import MetadataAgent
from agents.storyboard_agent import StoryboardAgent

class AgentRegistry:
    def __init__(self):
        self.registry: Dict[str, Type] = {
            "video-agent": VideoAgent,
            "audio-agent": AudioAgent,
            "metadata-agent": MetadataAgent,
            "storyboard-agent": StoryboardAgent
        }

    def get_agent_class(self, agent_id: str):
        return self.registry.get(agent_id)

    def list_agents(self):
        return list(self.registry.keys())
