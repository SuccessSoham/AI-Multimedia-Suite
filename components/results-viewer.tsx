import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, BarChart3 } from "lucide-react"
import type { ProcessingJob } from "@/app/page"

interface ResultsViewerProps {
  jobs: ProcessingJob[]
}

export function ResultsViewer({ jobs }: ResultsViewerProps) {
  const renderResults = (results: Record<string, any>, agentType: string) => {
    return (
      <div className="space-y-3">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded">
            <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            <span className="text-sm text-slate-600">{String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const getAgentName = (agentId: string) => {
    const names: Record<string, string> = {
      "video-agent": "Video Enhancement",
      "audio-agent": "Audio Optimization",
      "storyboard-agent": "Storyboard Generation",
      "metadata-agent": "Metadata Extraction",
    }
    return names[agentId] || agentId
  }

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      "video-agent": "bg-green-100 text-green-800",
      "audio-agent": "bg-purple-100 text-purple-800",
      "storyboard-agent": "bg-orange-100 text-orange-800",
      "metadata-agent": "bg-blue-100 text-blue-800",
    }
    return colors[agentId] || "bg-slate-100 text-slate-800"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processing Results</CardTitle>
          <CardDescription>View detailed results from completed processing jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No completed jobs yet. Process a file to see results here.
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{job.fileName}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Completed on {new Date().toLocaleDateString()} • Job ID: {job.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="video">Video</TabsTrigger>
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                        <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {Object.entries(job.results).map(([agentId, results]) => (
                            <Card key={agentId}>
                              <CardHeader className="pb-2">
                                <Badge className={`w-fit ${getAgentColor(agentId)}`}>{getAgentName(agentId)}</Badge>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-600">{Object.keys(results).length} metrics</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="video">
                        {job.results["video-agent"] ? (
                          renderResults(job.results["video-agent"], "video")
                        ) : (
                          <p className="text-slate-500">No video processing results available</p>
                        )}
                      </TabsContent>

                      <TabsContent value="audio">
                        {job.results["audio-agent"] ? (
                          renderResults(job.results["audio-agent"], "audio")
                        ) : (
                          <p className="text-slate-500">No audio processing results available</p>
                        )}
                      </TabsContent>

                      <TabsContent value="storyboard">
                        {job.results["storyboard-agent"] ? (
                          renderResults(job.results["storyboard-agent"], "storyboard")
                        ) : (
                          <p className="text-slate-500">No storyboard results available</p>
                        )}
                      </TabsContent>

                      <TabsContent value="metadata">
                        {job.results["metadata-agent"] ? (
                          renderResults(job.results["metadata-agent"], "metadata")
                        ) : (
                          <p className="text-slate-500">No metadata results available</p>
                        )}
                      </TabsContent>
                    </Tabs>
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
