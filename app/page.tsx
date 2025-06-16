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
      agents: ["metadata-agent", "video-agent", "audio-agent", "storyboard-agent"],
      results: {},
      fileData: fileData,
      fileSize: file.size,
    }

    setJobs((prev) => [job, ...prev])
    setIsProcessing(true)

    // Simulate orchestrator starting the pipeline
    addCommunicationMessage("orchestrator", "all-agents", "notification", {
      action: "pipeline_start",
      jobId: job.id,
      fileName: file.name,
      protocol: "A2A",
      timestamp: new Date().toISOString(),
    })

    try {
      // Simulate the agent processing order from your orchestrator
      const agentProcessingOrder = ["metadata-agent", "video-agent", "audio-agent", "storyboard-agent"]
      const jobResults: Record<string, any> = {}

      for (let i = 0; i < agentProcessingOrder.length; i++) {
        const agentId = agentProcessingOrder[i]
        const agent = agents.find((a) => a.id === agentId)

        if (!agent) continue

        // Start processing
        updateAgentStatus(agentId, "processing", 0, `Processing ${file.name}`)

        // Send A2A request message
        addCommunicationMessage("orchestrator", agentId, "request", {
          action: "process",
          jobId: job.id,
          fileName: file.name,
          fileType: file.type,
          dependencies: i > 0 ? [agentProcessingOrder[i - 1]] : [],
          timestamp: new Date().toISOString(),
        })

        // Simulate processing time with progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          updateAgentStatus(agentId, "processing", progress, `Processing ${file.name} - ${progress}%`)

          // Update job progress
          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id ? { ...j, progress: (i * 100 + progress) / agentProcessingOrder.length } : j,
            ),
          )
        }

        // Generate realistic results based on your agent implementations
        const agentResults = await generateAgentResults(agentId, file, job)
        jobResults[agentId] = agentResults

        // Complete processing
        updateAgentStatus(agentId, "completed", 100, `Completed processing ${file.name}`)

        // Send A2A response message
        addCommunicationMessage(agentId, "orchestrator", "response", {
          action: "process_complete",
          jobId: job.id,
          results: agentResults,
          processingTime: `${(Math.random() * 2 + 1).toFixed(2)}s`,
          timestamp: new Date().toISOString(),
        })

        // Update job results
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, results: { ...j.results, [agentId]: agentResults } } : j)),
        )
      }

      // Complete job
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "completed", progress: 100 } : j)))

      addCommunicationMessage("orchestrator", "all-agents", "notification", {
        action: "pipeline_complete",
        jobId: job.id,
        totalProcessingTime: `${(Math.random() * 10 + 5).toFixed(2)}s`,
        agentsCompleted: agentProcessingOrder.length,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Processing failed:", error)

      // Update job status to error
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "error", progress: 0 } : j)))

      // Send error notification
      addCommunicationMessage("orchestrator", "all-agents", "notification", {
        action: "pipeline_error",
        jobId: job.id,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })

      // Update agent statuses to error
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          status: "error" as const,
          progress: 0,
          lastMessage: `Error processing ${file.name}`,
        })),
      )
    }

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
    }, 3000)
  }

  // Add this helper function to generate realistic agent results
  const generateAgentResults = async (agentId: string, file: File, job: ProcessingJob) => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    switch (agentId) {
      case "metadata-agent":
        return {
          llm_summary: `AI Analysis of ${file.name}:\n\nThis ${file.type.split("/")[0]} file appears to contain ${file.type.includes("video") ? "dynamic visual content with multiple scenes and transitions" : file.type.includes("audio") ? "audio content with varying frequencies and tonal qualities" : "visual elements with structured composition"}. The content suggests ${Math.random() > 0.5 ? "professional production quality" : "user-generated content"} with ${Math.random() > 0.5 ? "clear narrative structure" : "documentary-style presentation"}.\n\nKey characteristics identified:\n- Content type: ${file.type.includes("video") ? "Video content" : file.type.includes("audio") ? "Audio content" : "Image content"}\n- Quality indicators: High resolution, good lighting\n- Estimated duration: ${Math.floor(Math.random() * 300 + 60)} seconds\n- Complexity level: ${Math.random() > 0.5 ? "High" : "Medium"}`,
          tags: [
            "ai-enhanced",
            file.type.includes("video") ? "video" : file.type.includes("audio") ? "audio" : "image",
            "processed",
            "analyzed",
          ],
          objects_detected: Math.floor(Math.random() * 20) + 5,
          sentiment: Math.random() > 0.5 ? "Positive" : "Neutral",
          confidence_score: (Math.random() * 0.3 + 0.7).toFixed(2),
          processing_model: "mistralai/Mistral-7B-Instruct-v0.2",
          extraction_time: `${(Math.random() * 2 + 1).toFixed(2)}s`,
        }

      case "video-agent":
        return {
          resolution: "4K Enhanced",
          noise_reduction: `${Math.floor(Math.random() * 20) + 80}% improvement`,
          color_correction: "Applied",
          scenes_detected: Math.floor(Math.random() * 15) + 8,
          frames_processed: Math.floor(Math.random() * 2000) + 1000,
          enhancement_applied: ["upscaling", "denoising", "color_grading", "stabilization"],
          output_format: "H.264/AVC",
          processing_time: `${(Math.random() * 3 + 2).toFixed(2)}s`,
        }

      case "audio-agent":
        return {
          noise_reduction: `${Math.floor(Math.random() * 15) + 85}% improvement`,
          quality: "48kHz stereo enhanced",
          speech_to_text:
            file.type.includes("video") || file.type.includes("audio")
              ? "Transcription completed"
              : "No audio detected",
          music_generated: Math.random() > 0.5,
          audio_enhancement: ["noise_gate", "eq_adjustment", "dynamic_range_compression"],
          sample_rate: "48000 Hz",
          bit_depth: "24-bit",
          processing_time: `${(Math.random() * 2 + 1).toFixed(2)}s`,
        }

      case "storyboard-agent":
        return {
          key_frames: Math.floor(Math.random() * 20) + 15,
          scenes: Math.floor(Math.random() * 10) + 8,
          transitions: Math.floor(Math.random() * 8) + 5,
          timeline_generated: true,
          composition_analysis: "Rule of thirds applied",
          visual_flow: "Smooth transitions detected",
          scene_types: ["establishing_shot", "close_up", "medium_shot", "wide_shot"],
          processing_time: `${(Math.random() * 2 + 1).toFixed(2)}s`,
        }

      default:
        return {
          status: "completed",
          processing_time: `${(Math.random() * 2 + 1).toFixed(2)}s`,
        }
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
