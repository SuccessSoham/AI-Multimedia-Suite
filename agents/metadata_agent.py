from typing import Dict
import asyncio
from lib.llm import run_llm

class MetadataAgent:
    def __init__(self, job_id: str, file_path: str, file_type: str):
        self.job_id = job_id
        self.file_path = file_path
        self.file_type = file_type

    async def process(self) -> Dict:
        print(f"[MetadataAgent] Extracting metadata from: {self.file_path}")
        await asyncio.sleep(1)

        prompt = (
            f"Extract metadata from a {self.file_type} file named '{self.file_path}'. "
            "Include tags, objects, sentiment, and a brief summary."
        )
        llm_output = run_llm(prompt)

        return {
            "llm_summary": llm_output,
            "tags": ["action", "outdoor", "daylight"],
            "objects_detected": 15,
            "sentiment": "Positive"
        }
