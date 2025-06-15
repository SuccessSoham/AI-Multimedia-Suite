"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentDashboard } from "@/components/agent-dashboard"
import { FileUploader } from "@/components/file-uploader"
import { ProcessingPipeline } from "@/components/processing-pipeline"
import { CommunicationLog } from "@/components/communication-log"
import { ResultsViewer } from "@/components/results-viewer"
import { DownloadManager } from "@/components/download-manager"

export interface Agent {
  id: string
  name: string
  type: "video" | "audio" | "storyboard" | "metadata"
  status: "idle" | "processing" | "completed" | "error"
  progress: number
  lastMessage: string
  capabilities: string[]
}

export interface ProcessingJob {
  id: string
  fileName: string
  fileType: string
  status: "queued" | "processing" | "completed" | "error"
  progress: number
  agents: string[]
  results: Record<string, any>
  fileData?: string // Add base64 encoded file data
  fileSize?: number
}

export interface CommunicationMessage {
  id: string
  timestamp: Date
  from: string
  to: string
  type: "request" | "response" | "notification"
  payload: any
  protocol: "A2A" | "gRPC" | "REST"
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "video-agent",
      name: "Video Enhancement Agent",
      type: "video",
      status: "idle",
      progress: 0,
      lastMessage: "Ready for video processing",
      capabilities: ["Noise Reduction", "Upscaling", "Color Correction", "Scene Detection"],
    },
    {
      id: "audio-agent",
      name: "Audio Optimization Agent",
      type: "audio",
      status: "idle",
      progress: 0,
      lastMessage: "Audio processing ready",
      capabilities: ["Noise Reduction", "Enhancement", "Music Generation", "Speech-to-Text"],
    },
    {
      id: "storyboard-agent",
      name: "Storyboard Generation Agent",
      type: "storyboard",
      status: "idle",
      progress: 0,
      lastMessage: "Storyboard analysis ready",
      capabilities: ["Scene Analysis", "Key Frame Extraction", "Visual Composition", "Timeline Generation"],
    },
    {
      id: "metadata-agent",
      name: "Metadata Extraction Agent",
      type: "metadata",
      status: "idle",
      progress: 0,
      lastMessage: "Metadata extraction ready",
      capabilities: ["OCR", "Object Detection", "Tag Generation", "Content Analysis"],
    },
  ])

  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [messages, setMessages] = useState<CommunicationMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addCommunicationMessage = (
    from: string,
    to: string,
    type: "request" | "response" | "notification",
    payload: any,
  ) => {
    const message: CommunicationMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      from,
      to,
      type,
      payload,
      protocol: "A2A",
    }
    setMessages((prev) => [message, ...prev].slice(0, 50)) // Keep last 50 messages
  }

  const updateAgentStatus = (agentId: string, status: Agent["status"], progress: number, message: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, status, progress, lastMessage: message } : agent)),
    )
  }

  const startProcessing = async (file: File) => {
    // Convert file to base64 for storage
    const fileData = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })

    const job: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileType: file.type,
      status: "queued",
      progress: 0,
      agents: ["video-agent", "audio-agent", "storyboard-agent", "metadata-agent"],
      results: {},
      fileData: fileData, // Store the actual file data
      fileSize: file.size,
    }

    // Rest of the function remains the same...
    setJobs((prev) => [job, ...prev])
    setIsProcessing(true)

    // Simulate orchestrator starting the pipeline
    addCommunicationMessage("orchestrator", "all-agents", "notification", {
      action: "pipeline_start",
      jobId: job.id,
      fileName: file.name,
    })

    // Simulate agent processing
    const agentProcessingOrder = ["metadata-agent", "video-agent", "audio-agent", "storyboard-agent"]

    for (let i = 0; i < agentProcessingOrder.length; i++) {
      const agentId = agentProcessingOrder[i]
      const agent = agents.find((a) => a.id === agentId)

      if (!agent) continue

      // Start processing
      updateAgentStatus(agentId, "processing", 0, `Processing ${file.name}`)
      addCommunicationMessage("orchestrator", agentId, "request", {
        action: "process",
        jobId: job.id,
        fileName: file.name,
        dependencies: i > 0 ? [agentProcessingOrder[i - 1]] : [],
      })

      // Simulate processing time
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        updateAgentStatus(agentId, "processing", progress, `Processing ${file.name} - ${progress}%`)

        // Update job progress
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, progress: (i * 100 + progress) / agentProcessingOrder.length } : j,
          ),
        )
      }

      // Complete processing
      updateAgentStatus(agentId, "completed", 100, `Completed processing ${file.name}`)
      addCommunicationMessage(agentId, "orchestrator", "response", {
        action: "process_complete",
        jobId: job.id,
        results: generateMockResults(agent.type),
      })

      // Update job results
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, results: { ...j.results, [agentId]: generateMockResults(agent.type) } } : j,
        ),
      )
    }

    // Complete job
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "completed", progress: 100 } : j)))

    addCommunicationMessage("orchestrator", "all-agents", "notification", {
      action: "pipeline_complete",
      jobId: job.id,
    })

    setIsProcessing(false)

    // Reset agents to idle after a delay
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          status: "idle",
          progress: 0,
          lastMessage: "Ready for next task",
        })),
      )
    }, 2000)
  }

  const generateMockResults = (agentType: string) => {
    switch (agentType) {
      case "video":
        return {
          resolution: "4K Enhanced",
          noiseReduction: "85% improvement",
          colorCorrection: "Applied",
          scenes: 12,
          enhancedFrames: 1440,
        }
      case "audio":
        return {
          noiseReduction: "92% improvement",
          audioQuality: "Enhanced to 48kHz",
          speechToText: "Transcription complete",
          musicGenerated: "Background score added",
        }
      case "storyboard":
        return {
          keyFrames: 24,
          scenes: 12,
          transitions: 11,
          composition: "Analyzed",
          timeline: "Generated",
        }
      case "metadata":
        return {
          tags: ["action", "outdoor", "daylight", "people"],
          objects: 15,
          text: "OCR extracted",
          sentiment: "Positive",
          duration: "2:34",
        }
      default:
        return {}
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">AI Multimedia Production Suite</h1>
          <p className="text-slate-600 text-lg">
            Collaborative agents working together for video enhancement, audio optimization, and content analysis
          </p>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload & Process</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AgentDashboard agents={agents} />
          </TabsContent>

          <TabsContent value="upload">
            <FileUploader onFileUpload={startProcessing} isProcessing={isProcessing} />
          </TabsContent>

          <TabsContent value="pipeline">
            <ProcessingPipeline jobs={jobs} agents={agents} />
          </TabsContent>

          <TabsContent value="communication">
            <CommunicationLog messages={messages} />
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-6">
              <ResultsViewer jobs={jobs.filter((j) => j.status === "completed")} />
              <DownloadManager jobs={jobs} />
            </div>
          </TabsContent>
          <TabsContent value="downloads">
            <DownloadManager jobs={jobs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
