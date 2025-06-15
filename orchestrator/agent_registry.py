from typing import Dict
from agents import VideoAgent, AudioAgent, MetadataAgent, StoryboardAgent

class AgentRegistry:
    def __init__(self):
        self.registry: Dict[str, type] = {
            "video-agent": VideoAgent,
            "audio-agent": AudioAgent,
            "metadata-agent": MetadataAgent,
            "storyboard-agent": StoryboardAgent
        }

    def get_agent_class(self, agent_id: str):
        return self.registry.get(agent_id)

    def list_agents(self):
        return list(self.registry.keys())
