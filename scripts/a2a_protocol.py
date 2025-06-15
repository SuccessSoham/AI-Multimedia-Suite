"""
A2A (Agent-to-Agent) Protocol Implementation
Based on Google's A2A protocol concepts for inter-agent communication
"""

import asyncio
import json
import time
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
import uuid
from datetime import datetime

class ProtocolVersion(Enum):
    V1_0 = "1.0"
    V2_0 = "2.0"

class MessagePriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class A2AHeader:
    version: str
    message_id: str
    timestamp: float
    from_agent: str
    to_agent: str
    priority: MessagePriority
    requires_ack: bool = False
    correlation_id: Optional[str] = None

@dataclass
class A2APayload:
    action: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class A2AMessage:
    header: A2AHeader
    payload: A2APayload
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "header": asdict(self.header),
            "payload": asdict(self.payload)
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'A2AMessage':
        header_data = data["header"]
        header = A2AHeader(
            version=header_data["version"],
            message_id=header_data["message_id"],
            timestamp=header_data["timestamp"],
            from_agent=header_data["from_agent"],
            to_agent=header_data["to_agent"],
            priority=MessagePriority(header_data["priority"]),
            requires_ack=header_data.get("requires_ack", False),
            correlation_id=header_data.get("correlation_id")
        )
        
        payload_data = data["payload"]
        payload = A2APayload(
            action=payload_data["action"],
            data=payload_data["data"],
            metadata=payload_data.get("metadata")
        )
        
        return cls(header=header, payload=payload)

class A2AProtocol:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.message_handlers: Dict[str, Callable] = {}
        self.pending_acks: Dict[str, A2AMessage] = {}
        self.message_history: List[A2AMessage] = []
        self.connected_agents: Dict[str, bool] = {}
        
    def register_handler(self, action: str, handler: Callable):
        """Register a message handler for a specific action"""
        self.message_handlers[action] = handler
        print(f"[{self.agent_id}] Registered handler for action: {action}")
        
    def create_message(self, 
                      to_agent: str, 
                      action: str, 
                      data: Dict[str, Any],
                      priority: MessagePriority = MessagePriority.NORMAL,
                      requires_ack: bool = False,
                      correlation_id: Optional[str] = None) -> A2AMessage:
        """Create a new A2A message"""
        
        header = A2AHeader(
            version=ProtocolVersion.V2_0.value,
            message_id=str(uuid.uuid4()),
            timestamp=time.time(),
            from_agent=self.agent_id,
            to_agent=to_agent,
            priority=priority,
            requires_ack=requires_ack,
            correlation_id=correlation_id
        )
        
        payload = A2APayload(
            action=action,
            data=data,
            metadata={
                "created_at": datetime.now().isoformat(),
                "agent_capabilities": self.get_capabilities()
            }
        )
        
        return A2AMessage(header=header, payload=payload)
    
    async def send_message(self, message: A2AMessage, transport_layer=None):
        """Send a message using the A2A protocol"""
        print(f"\n📤 [{self.agent_id}] Sending A2A message:")
        print(f"   To: {message.header.to_agent}")
        print(f"   Action: {message.payload.action}")
        print(f"   Priority: {message.header.priority.name}")
        print(f"   Message ID: {message.header.message_id}")
        
        # Store message in history
        self.message_history.append(message)
        
        # If acknowledgment is required, store in pending acks
        if message.header.requires_ack:
            self.pending_acks[message.header.message_id] = message
            
        # Simulate network transmission
        if transport_layer:
            await transport_layer.transmit(message)
        else:
            # Default simulation
            await asyncio.sleep(0.1)
            
        print(f"   ✅ Message sent successfully")
        
    async def receive_message(self, message: A2AMessage):
        """Receive and process an A2A message"""
        print(f"\n📥 [{self.agent_id}] Received A2A message:")
        print(f"   From: {message.header.from_agent}")
        print(f"   Action: {message.payload.action}")
        print(f"   Message ID: {message.header.message_id}")
        
        # Store message in history
        self.message_history.append(message)
        
        # Send acknowledgment if required
        if message.header.requires_ack:
            ack_message = self.create_message(
                to_agent=message.header.from_agent,
                action="ack",
                data={"ack_for": message.header.message_id},
                correlation_id=message.header.message_id
            )
            await self.send_message(ack_message)
            
        # Process the message
        action = message.payload.action
        if action in self.message_handlers:
            try:
                result = await self.message_handlers[action](message)
                print(f"   ✅ Message processed successfully")
                return result
            except Exception as e:
                print(f"   ❌ Error processing message: {e}")
                # Send error response
                error_message = self.create_message(
                    to_agent=message.header.from_agent,
                    action="error",
                    data={"error": str(e), "original_message_id": message.header.message_id},
                    correlation_id=message.header.message_id
                )
                await self.send_message(error_message)
        else:
            print(f"   ⚠️  No handler registered for action: {action}")
            
    def get_capabilities(self) -> List[str]:
        """Get the capabilities of this agent"""
        return list(self.message_handlers.keys())
        
    def get_message_stats(self) -> Dict[str, Any]:
        """Get statistics about message handling"""
        return {
            "total_messages": len(self.message_history),
            "pending_acks": len(self.pending_acks),
            "registered_handlers": len(self.message_handlers),
            "connected_agents": len(self.connected_agents)
        }

class MultimediaAgent:
    def __init__(self, agent_id: str, agent_type: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.protocol = A2AProtocol(agent_id)
        self.current_jobs: Dict[str, Dict[str, Any]] = {}
        
        # Register default handlers
        self.setup_handlers()
        
    def setup_handlers(self):
        """Setup message handlers for this agent"""
        self.protocol.register_handler("process", self.handle_process_request)
        self.protocol.register_handler("status", self.handle_status_request)
        self.protocol.register_handler("cancel", self.handle_cancel_request)
        self.protocol.register_handler("ack", self.handle_acknowledgment)
        self.protocol.register_handler("error", self.handle_error)
        
    async def handle_process_request(self, message: A2AMessage):
        """Handle a processing request"""
        job_data = message.payload.data
        job_id = job_data.get("job_id")
        
        print(f"[{self.agent_id}] Starting processing for job: {job_id}")
        
        # Store job information
        self.current_jobs[job_id] = {
            "status": "processing",
            "start_time": time.time(),
            "file_path": job_data.get("file_path"),
            "requester": message.header.from_agent
        }
        
        # Simulate processing based on agent type
        results = await self.simulate_processing(job_data)
        
        # Update job status
        self.current_jobs[job_id]["status"] = "completed"
        self.current_jobs[job_id]["results"] = results
        self.current_jobs[job_id]["end_time"] = time.time()
        
        # Send completion response
        response = self.protocol.create_message(
            to_agent=message.header.from_agent,
            action="process_complete",
            data={
                "job_id": job_id,
                "status": "completed",
                "results": results
            },
            correlation_id=message.header.message_id
        )
        
        await self.protocol.send_message(response)
        
    async def handle_status_request(self, message: A2AMessage):
        """Handle a status request"""
        status_data = {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "capabilities": self.capabilities,
            "active_jobs": len([j for j in self.current_jobs.values() if j["status"] == "processing"]),
            "total_jobs": len(self.current_jobs)
        }
        
        response = self.protocol.create_message(
            to_agent=message.header.from_agent,
            action="status_response",
            data=status_data,
            correlation_id=message.header.message_id
        )
        
        await self.protocol.send_message(response)
        
    async def handle_cancel_request(self, message: A2AMessage):
        """Handle a job cancellation request"""
        job_id = message.payload.data.get("job_id")
        
        if job_id in self.current_jobs:
            self.current_jobs[job_id]["status"] = "cancelled"
            print(f"[{self.agent_id}] Cancelled job: {job_id}")
            
        response = self.protocol.create_message(
            to_agent=message.header.from_agent,
            action="cancel_response",
            data={"job_id": job_id, "status": "cancelled"},
            correlation_id=message.header.message_id
        )
        
        await self.protocol.send_message(response)
        
    async def handle_acknowledgment(self, message: A2AMessage):
        """Handle acknowledgment messages"""
        ack_for = message.payload.data.get("ack_for")
        if ack_for in self.protocol.pending_acks:
            del self.protocol.pending_acks[ack_for]
            print(f"[{self.agent_id}] Received ACK for message: {ack_for}")
            
    async def handle_error(self, message: A2AMessage):
        """Handle error messages"""
        error = message.payload.data.get("error")
        original_id = message.payload.data.get("original_message_id")
        print(f"[{self.agent_id}] Received error for message {original_id}: {error}")
        
    async def simulate_processing(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate processing based on agent type"""
        
        # Simulate processing time
        processing_time = 2.0 if self.agent_type == "video" else 1.0
        await asyncio.sleep(processing_time)
        
        if self.agent_type == "video":
            return {
                "resolution_enhanced": "4K",
                "noise_reduction": "85% improvement",
                "color_correction": "Applied",
                "scenes_detected": 12,
                "frames_processed": 1440,
                "processing_time": processing_time
            }
        elif self.agent_type == "audio":
            return {
                "noise_reduction": "92% improvement",
                "audio_quality": "Enhanced to 48kHz",
                "speech_to_text": "Transcription complete",
                "background_music": "Generated",
                "processing_time": processing_time
            }
        elif self.agent_type == "storyboard":
            return {
                "key_frames": 24,
                "scenes": 12,
                "transitions": 11,
                "composition_analysis": "Complete",
                "timeline_generated": True,
                "processing_time": processing_time
            }
        elif self.agent_type == "metadata":
            return {
                "tags": ["action", "outdoor", "daylight", "people"],
                "objects_detected": 15,
                "text_extracted": "OCR complete",
                "sentiment": "Positive",
                "duration": "2:34",
                "processing_time": processing_time
            }
        
        return {"processing_time": processing_time}

async def demonstrate_a2a_protocol():
    """Demonstrate the A2A protocol with multiple agents"""
    print("🔗 A2A Protocol Demonstration")
    print("=" * 40)
    
    # Create multimedia agents
    agents = {
        "orchestrator": MultimediaAgent("orchestrator", "orchestrator", ["coordination", "scheduling"]),
        "video-agent": MultimediaAgent("video-agent", "video", ["enhancement", "upscaling", "noise_reduction"]),
        "audio-agent": MultimediaAgent("audio-agent", "audio", ["optimization", "transcription", "music_generation"]),
        "metadata-agent": MultimediaAgent("metadata-agent", "metadata", ["ocr", "tagging", "analysis"])
    }
    
    print(f"Created {len(agents)} agents with A2A protocol support")
    
    # Simulate orchestrator requesting status from all agents
    orchestrator = agents["orchestrator"]
    
    for agent_id, agent in agents.items():
        if agent_id != "orchestrator":
            status_request = orchestrator.protocol.create_message(
                to_agent=agent_id,
                action="status",
                data={"request_type": "full_status"},
                requires_ack=True
            )
            
            await orchestrator.protocol.send_message(status_request)
            await agent.protocol.receive_message(status_request)
    
    # Simulate a processing pipeline
    job_id = str(uuid.uuid4())
    file_data = {
        "job_id": job_id,
        "file_path": "/uploads/sample_video.mp4",
        "file_type": "video/mp4"
    }
    
    print(f"\n🎬 Starting processing pipeline for job: {job_id}")
    
    # Process through each agent
    for agent_id in ["metadata-agent", "video-agent", "audio-agent"]:
        agent = agents[agent_id]
        
        process_request = orchestrator.protocol.create_message(
            to_agent=agent_id,
            action="process",
            data=file_data,
            priority=MessagePriority.HIGH,
            requires_ack=True
        )
        
        await orchestrator.protocol.send_message(process_request)
        await agent.protocol.receive_message(process_request)
    
    # Print protocol statistics
    print(f"\n📊 A2A Protocol Statistics:")
    for agent_id, agent in agents.items():
        stats = agent.protocol.get_message_stats()
        print(f"  {agent_id}:")
        print(f"    Messages: {stats['total_messages']}")
        print(f"    Handlers: {stats['registered_handlers']}")
        print(f"    Pending ACKs: {stats['pending_acks']}")

if __name__ == "__main__":
    asyncio.run(demonstrate_a2a_protocol())
