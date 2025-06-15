"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, BarChart3 } from "lucide-react"
import type { ProcessingJob } from "@/app/page"

// Add these imports at the top
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

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
                        <DownloadDialog job={job} />
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

// Add the DownloadDialog component at the end of the file:
function DownloadDialog({ job }: { job: ProcessingJob }) {
  const [selectedFormat, setSelectedFormat] = useState<string>("json")
  const [selectedAgents, setSelectedAgents] = useState<string[]>(Object.keys(job.results))
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadFormats = [
    { value: "json", label: "JSON", description: "Structured data format" },
    { value: "csv", label: "CSV", description: "Comma-separated values" },
    { value: "xml", label: "XML", description: "Extensible markup language" },
    { value: "pdf", label: "PDF Report", description: "Formatted report document" },
    { value: "zip", label: "ZIP Archive", description: "All results in compressed archive" },
  ]

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      let downloadData: any
      let filename: string
      let mimeType: string

      switch (selectedFormat) {
        case "json":
          downloadData = generateJSONDownload(job, selectedAgents, includeMetadata)
          filename = `${job.fileName.split(".")[0]}_results.json`
          mimeType = "application/json"
          break
        case "csv":
          downloadData = generateCSVDownload(job, selectedAgents, includeMetadata)
          filename = `${job.fileName.split(".")[0]}_results.csv`
          mimeType = "text/csv"
          break
        case "xml":
          downloadData = generateXMLDownload(job, selectedAgents, includeMetadata)
          filename = `${job.fileName.split(".")[0]}_results.xml`
          mimeType = "application/xml"
          break
        case "pdf":
          downloadData = await generatePDFDownload(job, selectedAgents, includeMetadata)
          filename = `${job.fileName.split(".")[0]}_report.pdf`
          mimeType = "application/pdf"
          break
        case "zip":
          downloadData = await generateZIPDownload(job, selectedAgents, includeMetadata)
          filename = `${job.fileName.split(".")[0]}_complete.zip`
          mimeType = "application/zip"
          break
        default:
          throw new Error("Unsupported format")
      }

      // Create and trigger download
      const blob = new Blob([downloadData], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const generateJSONDownload = (job: ProcessingJob, agents: string[], metadata: boolean) => {
    const results: any = {
      job: {
        id: job.id,
        fileName: job.fileName,
        status: job.status,
        progress: job.progress,
      },
      results: {},
    }

    if (metadata) {
      results.metadata = {
        downloadedAt: new Date().toISOString(),
        selectedAgents: agents,
        totalAgents: Object.keys(job.results).length,
      }
    }

    agents.forEach((agentId) => {
      if (job.results[agentId]) {
        results.results[agentId] = job.results[agentId]
      }
    })

    return JSON.stringify(results, null, 2)
  }

  const generateCSVDownload = (job: ProcessingJob, agents: string[], metadata: boolean) => {
    let csv = "Agent,Metric,Value\n"

    if (metadata) {
      csv += `Metadata,Job ID,${job.id}\n`
      csv += `Metadata,File Name,${job.fileName}\n`
      csv += `Metadata,Status,${job.status}\n`
      csv += `Metadata,Progress,${job.progress}%\n`
      csv += `Metadata,Downloaded At,${new Date().toISOString()}\n`
    }

    agents.forEach((agentId) => {
      if (job.results[agentId]) {
        const results = job.results[agentId]
        Object.entries(results).forEach(([key, value]) => {
          csv += `${getAgentName(agentId)},${key},${value}\n`
        })
      }
    })

    return csv
  }

  const generateXMLDownload = (job: ProcessingJob, agents: string[], metadata: boolean) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<ProcessingResults>\n'

    if (metadata) {
      xml += "  <Metadata>\n"
      xml += `    <JobId>${job.id}</JobId>\n`
      xml += `    <FileName>${job.fileName}</FileName>\n`
      xml += `    <Status>${job.status}</Status>\n`
      xml += `    <Progress>${job.progress}</Progress>\n`
      xml += `    <DownloadedAt>${new Date().toISOString()}</DownloadedAt>\n`
      xml += "  </Metadata>\n"
    }

    xml += "  <Results>\n"
    agents.forEach((agentId) => {
      if (job.results[agentId]) {
        xml += `    <Agent id="${agentId}" name="${getAgentName(agentId)}">\n`
        const results = job.results[agentId]
        Object.entries(results).forEach(([key, value]) => {
          xml += `      <${key}>${value}</${key}>\n`
        })
        xml += "    </Agent>\n"
      }
    })
    xml += "  </Results>\n</ProcessingResults>"

    return xml
  }

  const generatePDFDownload = async (job: ProcessingJob, agents: string[], metadata: boolean) => {
    // For a real implementation, you'd use a library like jsPDF
    // This is a mock implementation that creates a text-based "PDF"
    let content = `AI MULTIMEDIA PRODUCTION SUITE - PROCESSING REPORT\n\n`

    if (metadata) {
      content += `Job Information:\n`
      content += `- Job ID: ${job.id}\n`
      content += `- File Name: ${job.fileName}\n`
      content += `- Status: ${job.status}\n`
      content += `- Progress: ${job.progress}%\n`
      content += `- Generated: ${new Date().toLocaleString()}\n\n`
    }

    content += `Processing Results:\n\n`
    agents.forEach((agentId) => {
      if (job.results[agentId]) {
        content += `${getAgentName(agentId)}:\n`
        const results = job.results[agentId]
        Object.entries(results).forEach(([key, value]) => {
          content += `  • ${key}: ${value}\n`
        })
        content += "\n"
      }
    })

    return content
  }

  const generateZIPDownload = async (job: ProcessingJob, agents: string[], metadata: boolean) => {
    // For a real implementation, you'd use a library like JSZip
    // This creates a mock ZIP content
    let zipContent = "ZIP Archive Contents:\n\n"

    zipContent += "Files included:\n"
    zipContent += "- results.json\n"
    zipContent += "- results.csv\n"
    zipContent += "- results.xml\n"
    zipContent += "- report.pdf\n\n"

    zipContent += "JSON Content:\n"
    zipContent += generateJSONDownload(job, agents, metadata)

    return zipContent
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Download Processing Results</AlertDialogTitle>
          <AlertDialogDescription>
            Choose your preferred format and options for downloading the results of {job.fileName}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Download Format</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {downloadFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Include Results From</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(job.results).map((agentId) => (
                <div key={agentId} className="flex items-center space-x-2">
                  <Checkbox
                    id={agentId}
                    checked={selectedAgents.includes(agentId)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAgents([...selectedAgents, agentId])
                      } else {
                        setSelectedAgents(selectedAgents.filter((id) => id !== agentId))
                      }
                    }}
                  />
                  <label htmlFor={agentId} className="text-sm">
                    {getAgentName(agentId)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            <div className="flex items-center space-x-2">
              <Checkbox id="metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
              <label htmlFor="metadata" className="text-sm">
                Include job metadata and timestamps
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Download Preview:</div>
            <div className="text-xs text-muted-foreground">
              Format: {downloadFormats.find((f) => f.value === selectedFormat)?.label}
              <br />
              Agents: {selectedAgents.length} of {Object.keys(job.results).length}
              <br />
              Metadata: {includeMetadata ? "Included" : "Excluded"}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDownload} disabled={isDownloading || selectedAgents.length === 0}>
            {isDownloading ? "Downloading..." : "Download"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
