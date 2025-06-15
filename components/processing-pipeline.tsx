import type React from "react"
import { Badge } from "@/components/ui/badge"

const getPipelineSteps = () => {
  return [
    { id: "upload", name: "File Upload", status: "completed" },
    { id: "orchestrator", name: "Orchestrator Init", status: "completed" },
    { id: "metadata-agent", name: "Metadata Extraction (LLM)", status: "processing" },
    { id: "video-agent", name: "Video Enhancement", status: "queued" },
    { id: "audio-agent", name: "Audio Optimization", status: "queued" },
    { id: "storyboard-agent", name: "Storyboard Generation", status: "queued" },
    { id: "completion", name: "Results Compilation", status: "queued" },
  ]
}

interface ProcessingPipelineProps {
  jobs: any[]
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ jobs }) => {
  const pipelineSteps = getPipelineSteps()

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Agent Orchestrator Status</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            A2A Protocol Active
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {jobs.filter((j) => j.status === "processing").length} Jobs Processing
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            LLM Integration Enabled
          </Badge>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        {pipelineSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                step.status === "completed"
                  ? "bg-green-200 text-green-800"
                  : step.status === "processing"
                    ? "bg-yellow-200 text-yellow-800 animate-pulse"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.name.substring(0, 3)}
            </div>
            <div className="text-sm">{step.name}</div>
            {index < pipelineSteps.length - 1 && (
              <div className="md:mx-4 my-2 md:my-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProcessingPipeline
