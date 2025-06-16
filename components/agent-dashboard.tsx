import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Clock, Cpu } from "lucide-react"
import type { Agent } from "@/app/page"

interface AgentDashboardProps {
  agents: Agent[]
}

export function AgentDashboard({ agents }: AgentDashboardProps) {
  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "idle":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Cpu className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "idle":
        return "secondary"
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {agents.map((agent) => (
        <Card key={agent.id} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <Badge variant={getStatusColor(agent.status)} className="flex items-center gap-1">
                {getStatusIcon(agent.status)}
                {agent.status}
              </Badge>
            </div>
            <CardDescription>{agent.lastMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agent.status === "processing" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <Progress value={agent.progress} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Capabilities</h4>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((capability) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                    {agent.id === "metadata-agent" && capability === "Content Analysis" && (
                      <span className="ml-1 text-blue-500">🤖</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>

          {agent.status === "processing" && <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />}
        </Card>
      ))}
    </div>
  )
}
