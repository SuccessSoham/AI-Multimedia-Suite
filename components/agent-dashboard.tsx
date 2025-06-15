import type React from "react"
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Agent {
  id: string
  name: string
  status: "idle" | "processing" | "completed" | "error"
  capabilities: string[]
}

interface AgentDashboardProps {
  agent: Agent
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ agent }) => {
  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "idle":
        return <Circle className="h-4 w-4 text-gray-400" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold">{agent.name}</h3>
      <div className="flex items-center mt-2">
        <span>Status:</span>
        {getStatusIcon(agent.status)}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Capabilities</h4>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((capability, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {capability}
              {agent.id === "metadata-agent" && capability === "Content Analysis" && (
                <span className="ml-1 text-blue-500">🤖</span>
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
