"use client"

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
          <div key={key} className="flex justify-between items-start p-3 bg-slate-50 rounded">
            <span className="text-sm font-medium capitalize flex-shrink-0 mr-4">
              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
            </span>
            <div className="text-sm text-slate-600 text-right">
              {key === "llm_summary" ? (
                <div className="max-w-md">
                  <pre className="whitespace-pre-wrap text-xs">{String(value)}</pre>
                </div>
              ) : Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1">
                  {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {String(item)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
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
      "metadata-agent": "Metadata Extraction (LLM-Enhanced)",
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

  // Add these functions before the return statement:
  const handlePreview = (job: ProcessingJob) => {
    // Create a preview window with job results
    const previewWindow = window.open("", "_blank", "width=800,height=600")
    if (previewWindow) {
      previewWindow.document.write(`
      <html>
        <head>
          <title>Preview: ${job.fileName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .result-section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .result-title { font-weight: bold; color: #333; margin-bottom: 10px; }
            .result-data { background: #f5f5f5; padding: 10px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>Processing Results: ${job.fileName}</h1>
          <p><strong>Job ID:</strong> ${job.id}</p>
          <p><strong>Status:</strong> ${job.status}</p>
          <p><strong>Progress:</strong> ${job.progress}%</p>
          ${Object.entries(job.results)
            .map(
              ([agentId, results]) => `
            <div class="result-section">
              <div class="result-title">${getAgentName(agentId)} Results</div>
              <div class="result-data">
                <pre>${JSON.stringify(results, null, 2)}</pre>
              </div>
            </div>
          `,
            )
            .join("")}
        </body>
      </html>
    `)
      previewWindow.document.close()
    }
  }

  const handleDownload = (job: ProcessingJob, format = "json") => {
    let content: string
    let filename: string
    let mimeType: string

    switch (format) {
      case "json":
        content = JSON.stringify(
          {
            job: {
              id: job.id,
              fileName: job.fileName,
              status: job.status,
              progress: job.progress,
            },
            results: job.results,
            metadata: {
              downloadedAt: new Date().toISOString(),
              format: "JSON",
            },
          },
          null,
          2,
        )
        filename = `${job.fileName.split(".")[0]}_results.json`
        mimeType = "application/json"
        break
      case "csv":
        let csv = "Agent,Metric,Value\n"
        Object.entries(job.results).forEach(([agentId, results]) => {
          Object.entries(results).forEach(([key, value]) => {
            csv += `${getAgentName(agentId)},${key},${value}\n`
          })
        })
        content = csv
        filename = `${job.fileName.split(".")[0]}_results.csv`
        mimeType = "text/csv"
        break
      default:
        content = JSON.stringify(job.results, null, 2)
        filename = `${job.fileName.split(".")[0]}_results.json`
        mimeType = "application/json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
                      {/* Replace the download button section in the CardHeader with: */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(job)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(job, "json")}>
                          <Download className="h-4 w-4 mr-2" />
                          Download JSON
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(job, "csv")}>
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
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
