import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List

from orchestrator.agent_registry import AgentRegistry
from orchestrator.message import A2AMessage, MessageType
from lib.validate_outputs import validate_agent_output
from agents.storyboard_agent import StoryboardAgent


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

            # Instantiate agent with appropriate constructor
            try:
                if agent_id == "metadata-agent":
                    agent = AgentClass(job_id=job_id, file_path=file_path, file_type=file_type)
                else:
                    agent = AgentClass(job_id=job_id, file_path=file_path)
            except Exception as e:
                print(f"[!] Failed to initialize {agent_id}: {e}")
                continue

            # Send request message
            request = A2AMessage(
                from_agent="orchestrator",
                to_agent=agent_id,
                message_type=MessageType.REQUEST,
                payload={
                    "action": "process",
                    "jobId": job_id,
                    "fileName": file_path.split("/")[-1],
                    "fileType": file_type,
                    "dependencies": [],
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            await self.send_message(request)

            # Run agent and collect result
            try:
                result = await agent.process()
            except Exception as e:
                result = {"error": f"{agent_id} crashed: {e}"}

            # Validate output
            is_valid = validate_agent_output(agent_id, result)
            result["validation"] = "✅ Output verified" if is_valid else "❌ Failed validation"

            self.jobs[job_id]["results"][agent_id] = result

            # Send response message
            response = A2AMessage(
                from_agent=agent_id,
                to_agent="orchestrator",
                message_type=MessageType.RESPONSE,
                payload={
                    "action": "process_complete",
                    "jobId": job_id,
                    "results": result,
                    "processingTime": f"{round((datetime.now() - self.jobs[job_id]['started_at']).total_seconds(), 2)}s",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            await self.send_message(response)

        self.jobs[job_id]["status"] = "completed"
        self.jobs[job_id]["completed_at"] = datetime.now()

        # Final pipeline notification
        final_msg = A2AMessage(
            from_agent="orchestrator",
            to_agent="all-agents",
            message_type=MessageType.NOTIFICATION,
            payload={
                "action": "pipeline_complete",
                "jobId": job_id,
                "totalProcessingTime": f"{round((self.jobs[job_id]['completed_at'] - self.jobs[job_id]['started_at']).total_seconds(), 2)}s",
                "agentsCompleted": len(self.jobs[job_id]["results"]),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        await self.send_message(final_msg)

        print(f"\n✅ Job {job_id} completed.")
        return job_id

    async def send_message(self, message: A2AMessage):
        self.messages.append(message)
        print(f"\n📨 {message.from_agent} → {message.to_agent} [{message.message_type.value}]")
        print(message.payload)
        await asyncio.sleep(0.1)
