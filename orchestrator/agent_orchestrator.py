import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List

from orchestrator.agent_registry import AgentRegistry
from orchestrator.message import A2AMessage, MessageType

class AgentOrchestrator:
    def __init__(self):
        self.registry = AgentRegistry()
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.messages: List[A2AMessage] = []

    async def process_file(self, file_path: str, file_type: str) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "id": job_id,
            "file_path": file_path,
            "file_type": file_type,
            "results": {},
            "status": "processing",
            "started_at": datetime.now()
        }

        print(f"\n🚀 Starting job {job_id}: {file_path} ({file_type})")

        for agent_id in self.registry.list_agents():
            AgentClass = self.registry.get_agent_class(agent_id)
            if not AgentClass:
                print(f"[!] Agent class not found for {agent_id}")
                continue

            # Instantiate agent with appropriate args
            if agent_id == "metadata-agent":
                agent = AgentClass(job_id=job_id, file_path=file_path, file_type=file_type)
            else:
                agent = AgentClass(job_id=job_id, file_path=file_path)

            # Send request message
            request = A2AMessage(
                from_agent="orchestrator",
                to_agent=agent_id,
                message_type=MessageType.REQUEST,
                payload={"job_id": job_id, "file_path": file_path, "file_type": file_type}
            )
            await self.send_message(request)

            # Run agent and collect result
            result = await agent.process()
            self.jobs[job_id]["results"][agent_id] = result

            # Send response message
            response = A2AMessage(
                from_agent=agent_id,
                to_agent="orchestrator",
                message_type=MessageType.RESPONSE,
                payload={"job_id": job_id, "results": result}
            )
            await self.send_message(response)

        self.jobs[job_id]["status"] = "completed"
        self.jobs[job_id]["completed_at"] = datetime.now()
        print(f"\n✅ Job {job_id} completed.")
        return job_id

    async def send_message(self, message: A2AMessage):
        self.messages.append(message)
        print(f"\n📨 {message.from_agent} → {message.to_agent} [{message.message_type.value}]")
        print(message.payload)
        await asyncio.sleep(0.1)
