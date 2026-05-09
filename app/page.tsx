"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentDashboard } from "@/components/agent-dashboard"
import { FileUploader } from "@/components/file-uploader"
import { ProcessingPipeline } from "@/components/processing-pipeline"
import { CommunicationLog } from "@/components/communication-log"
import { ResultsViewer } from "@/components/results-viewer"
import { CreativePulse } from "@/components/creative-pulse"
import { JarvisConsole, type LogEntry } from "@/components/jarvis-console"
import { NeuralPulse } from "@/components/neural-pulse"
import { Toaster, toast } from "sonner"
import { getJobsFromVault, saveJobToVault, type SavedJob } from "@/lib/vault"
import { Zap } from "lucide-react"

export interface Agent {
  id: string
  name: string
  type: "video" | "audio" | "storyboard" | "metadata" | "creative"
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
    {
      id: "creative-agent",
      name: "Creative Pulse Orchestrator",
      type: "creative",
      status: "idle",
      progress: 0,
      lastMessage: "Multimodal engine standing by",
      capabilities: ["F5-TTS Cloning", "FLUX.1 Image Gen", "MusicGen Melody", "Whisper Large V3"],
    },
  ])

  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [messages, setMessages] = useState<CommunicationMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Load jobs from Vault on mount
  useEffect(() => {
    const loadVault = async () => {
      try {
        const savedJobs = await getJobsFromVault()
        if (savedJobs.length > 0) {
          setJobs(savedJobs.map(sj => ({
            id: sj.id,
            fileName: sj.fileName,
            fileType: sj.fileType,
            status: sj.status as any,
            progress: sj.progress,
            agents: sj.agents,
            results: sj.results
          })))
          addLog("SYSTEM", `Vault synchronized. ${savedJobs.length} records retrieved.`, "success")
        }
      } catch (e) {
        addLog("SYSTEM", "Failed to initialize Vault connection", "error")
      }
    }
    loadVault()
  }, [])

  const addLog = (source: string, message: string, type: LogEntry["type"] = "info", data?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      source,
      message,
      type,
      data
    }
    setConsoleLogs(prev => [...prev, newLog])
  }

  const handleCreativePulse = async (prompt: string) => {
    setIsGenerating(true)
    addLog("ORCHESTRATOR", `Initializing Creative Pulse for: "${prompt}"`, "info")
    updateAgentStatus("creative-agent", "processing", 10, "Routing request to Multi-Mesh Router...")

    try {
      // Phase 1: Mesh Routing
      addLog("ROUTER", "Resolving providers for multimodal task...", "raw")
      await new Promise(r => setTimeout(r, 800))
      addLog("ROUTER", "FLUX.1-schnell (HF) selected for Image Engine", "success")
      addLog("ROUTER", "MusicGen-Melody selected for Audio Synthesis", "success")
      
      updateAgentStatus("creative-agent", "processing", 30, "Generating assets in Hilbert Space...")
      
      // Call our API
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" }
      })
      
      const result = await response.json()
      addLog("ENGINE", "Multimodal generation payload received", "raw", result)

      if (!response.ok) throw new Error(result.error || "Generation failed")

      updateAgentStatus("creative-agent", "completed", 100, "Multimodal assets successfully synthesized")
      addLog("ORCHESTRATOR", "Creative Pulse execution complete", "success")
      toast.success("Multimodal synthesis complete!")
      
      // Add to results and Vault
      const job: ProcessingJob = {
        id: `creative-${Math.random().toString(36).substr(2, 5)}`,
        fileName: `Creative: ${prompt.substring(0, 20)}...`,
        fileType: "multimodal/output",
        status: "completed",
        progress: 100,
        agents: ["creative-agent"],
        results: { "creative-agent": result },
      }
      setJobs(prev => [job, ...prev])
      await saveJobToVault(job as SavedJob)
      addLog("VAULT", `Job ${job.id} persisted to local storage`, "info")

    } catch (error: any) {
      addLog("ERROR", error.message, "error")
      updateAgentStatus("creative-agent", "error", 0, "Synthesis failed")
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        updateAgentStatus("creative-agent", "idle", 0, "Multimodal engine standing by")
      }, 3000)
    }
  }

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
    const job: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileType: file.type,
      status: "queued",
      progress: 0,
      agents: ["video-agent", "audio-agent", "storyboard-agent", "metadata-agent"],
      results: {},
    }

    setJobs((prev) => [job, ...prev])
    setIsProcessing(true)
    addLog("ORCHESTRATOR", `Starting pipeline for file: ${file.name}`, "info")

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
      addLog(agentId.toUpperCase(), `Starting task for job ${job.id}`, "info")
      addCommunicationMessage("orchestrator", agentId, "request", {
        action: "process",
        jobId: job.id,
        fileName: file.name,
        dependencies: i > 0 ? [agentProcessingOrder[i - 1]] : [],
      })

      // Simulate processing time
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

      // Complete processing
      const results = generateMockResults(agent.type)
      updateAgentStatus(agentId, "completed", 100, `Completed processing ${file.name}`)
      addLog(agentId.toUpperCase(), `Task complete. Results attached.`, "success", results)
      addCommunicationMessage(agentId, "orchestrator", "response", {
        action: "process_complete",
        jobId: job.id,
        results,
      })

      // Update job results
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, results: { ...j.results, [agentId]: results } } : j,
        ),
      )
    }

    // Complete job
    const finalJobs = jobs.map((j) => (j.id === job.id ? { ...j, status: "completed", progress: 100 } : j))
    setJobs(finalJobs)
    
    // Save to Vault
    const completedJob = finalJobs.find(j => j.id === job.id)
    if (completedJob) await saveJobToVault(completedJob as SavedJob)

    addCommunicationMessage("orchestrator", "all-agents", "notification", {
      action: "pipeline_complete",
      jobId: job.id,
    })

    setIsProcessing(false)
    addLog("ORCHESTRATOR", `Pipeline complete for job ${job.id}`, "success")
    addLog("VAULT", `Job ${job.id} persisted to local storage`, "info")

    // Reset agents to idle after a delay
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((agent) => 
          agent.type !== "creative" ? {
            ...agent,
            status: "idle",
            progress: 0,
            lastMessage: "Ready for next task",
          } : agent
        ),
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
    <div className="min-h-screen p-6 relative overflow-hidden">
      <NeuralPulse />
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto space-y-8 pb-72">
        {/* Header */}
        <div className="text-center space-y-3 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <Zap className="w-3 h-3" />
            Suit v2.0 Online
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
            AI MULTIMEDIA <span className="text-primary">SUITE</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            The creative frontier of agentic orchestration. 
            One pulse. Infinite possibilities.
          </p>
        </div>

        {/* Multimodal Input */}
        <div className="max-w-4xl mx-auto">
          <CreativePulse onGenerate={handleCreativePulse} isLoading={isGenerating} />
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-background/50 backdrop-blur-md border border-white/10 p-1 h-12">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-white">Upload</TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-primary data-[state=active]:text-white">Pipeline</TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-primary data-[state=active]:text-white">A2A Protocol</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-white">Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <AgentDashboard agents={agents} />
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <FileUploader onFileUpload={startProcessing} isProcessing={isProcessing} />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-0">
            <ProcessingPipeline jobs={jobs} agents={agents} />
          </TabsContent>

          <TabsContent value="communication" className="mt-0">
            <CommunicationLog messages={messages} />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <ResultsViewer jobs={jobs.filter((j) => j.status === "completed")} />
          </TabsContent>
        </Tabs>
      </div>

      <JarvisConsole logs={consoleLogs} />
    </div>
  )
}


