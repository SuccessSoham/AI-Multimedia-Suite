import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react"
import type { ProcessingJob, Agent } from "@/app/page"

interface ProcessingPipelineProps {
  jobs: ProcessingJob[]
  agents: Agent[]
}

export function ProcessingPipeline({ jobs, agents }: ProcessingPipelineProps) {
  const getStatusIcon = (status: ProcessingJob["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ProcessingJob["status"]) => {
    switch (status) {
      case "queued":
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processing Pipeline</CardTitle>
          <CardDescription>Monitor the progress of your multimedia processing jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No processing jobs yet. Upload a file to get started.</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{job.fileName}</CardTitle>
                      <Badge variant={getStatusColor(job.status)} className="flex items-center gap-1">
                        {getStatusIcon(job.status)}
                        {job.status}
                      </Badge>
                    </div>
                    <CardDescription>Job ID: {job.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {job.agents.map((agentId) => {
                        const agent = agents.find((a) => a.id === agentId)
                        if (!agent) return null

                        return (
                          <div key={agentId} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{agent.name.split(" ")[0]}</span>
                              <Badge variant="outline" size="sm">
                                {agent.status}
                              </Badge>
                            </div>
                            {agent.status === "processing" && <Progress value={agent.progress} className="h-1" />}
                          </div>
                        )
                      })}
                    </div>

                    {Object.keys(job.results).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Results Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {Object.entries(job.results).map(([agentId, results]) => {
                            const agent = agents.find((a) => a.id === agentId)
                            return (
                              <div key={agentId} className="p-2 bg-green-50 rounded">
                                <span className="font-medium">{agent?.name.split(" ")[0]}:</span>
                                <span className="ml-1">{Object.keys(results).length} metrics processed</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
