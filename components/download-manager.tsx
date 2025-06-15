"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Archive, ImageIcon, Video, Music, Trash2, RefreshCw } from "lucide-react"
import type { ProcessingJob } from "@/app/page"

interface DownloadItem {
  id: string
  jobId: string
  fileName: string
  format: string
  size: string
  status: "preparing" | "ready" | "downloading" | "completed" | "error"
  progress: number
  downloadUrl?: string
  createdAt: Date
  expiresAt: Date
}

interface DownloadManagerProps {
  jobs: ProcessingJob[]
}

export function DownloadManager({ jobs }: DownloadManagerProps) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const generateDownload = async (job: ProcessingJob, format: string) => {
    setIsGenerating(job.id)

    const downloadItem: DownloadItem = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: job.id,
      fileName: `${job.fileName.split(".")[0]}_results.${format}`,
      format: format.toUpperCase(),
      size: "Calculating...",
      status: "preparing",
      progress: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }

    setDownloads((prev) => [downloadItem, ...prev])

    // Simulate download preparation
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadItem.id ? { ...item, progress, status: progress === 100 ? "ready" : "preparing" } : item,
        ),
      )
    }

    // Calculate estimated file size
    const estimatedSize = calculateFileSize(job, format)
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === downloadItem.id
          ? { ...item, size: estimatedSize, downloadUrl: `#download-${downloadItem.id}` }
          : item,
      ),
    )

    setIsGenerating(null)
  }

  const calculateFileSize = (job: ProcessingJob, format: string): string => {
    const baseSize = Object.keys(job.results).length * 1024 // Base size per agent
    let multiplier = 1

    switch (format) {
      case "json":
        multiplier = 1.2
        break
      case "csv":
        multiplier = 0.8
        break
      case "xml":
        multiplier = 1.5
        break
      case "pdf":
        multiplier = 2.0
        break
      case "zip":
        multiplier = 3.0
        break
    }

    const sizeInKB = Math.round(baseSize * multiplier)
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`
    }
  }

  const downloadFile = async (item: DownloadItem) => {
    setDownloads((prev) => prev.map((d) => (d.id === item.id ? { ...d, status: "downloading", progress: 0 } : d)))

    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setDownloads((prev) => prev.map((d) => (d.id === item.id ? { ...d, progress } : d)))
    }

    // Complete download
    setDownloads((prev) => prev.map((d) => (d.id === item.id ? { ...d, status: "completed", progress: 100 } : d)))

    // Trigger actual download
    const job = jobs.find((j) => j.id === item.jobId)
    if (job) {
      triggerDownload(job, item.format.toLowerCase(), item.fileName)
    }
  }

  const triggerDownload = (job: ProcessingJob, format: string, fileName: string) => {
    let content: string
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
        mimeType = "application/json"
        break
      case "csv":
        content = generateCSV(job)
        mimeType = "text/csv"
        break
      case "xml":
        content = generateXML(job)
        mimeType = "application/xml"
        break
      case "pdf":
        content = generatePDF(job)
        mimeType = "application/pdf"
        break
      case "zip":
        content = generateZIP(job)
        mimeType = "application/zip"
        break
      default:
        content = JSON.stringify(job.results, null, 2)
        mimeType = "application/json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateCSV = (job: ProcessingJob): string => {
    let csv = "Agent,Metric,Value\n"
    Object.entries(job.results).forEach(([agentId, results]) => {
      Object.entries(results).forEach(([key, value]) => {
        csv += `${agentId},${key},${value}\n`
      })
    })
    return csv
  }

  const generateXML = (job: ProcessingJob): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<ProcessingResults>\n'
    xml += `  <Job id="${job.id}" fileName="${job.fileName}" status="${job.status}"/>\n`
    xml += "  <Results>\n"
    Object.entries(job.results).forEach(([agentId, results]) => {
      xml += `    <Agent id="${agentId}">\n`
      Object.entries(results).forEach(([key, value]) => {
        xml += `      <${key}>${value}</${key}>\n`
      })
      xml += "    </Agent>\n"
    })
    xml += "  </Results>\n</ProcessingResults>"
    return xml
  }

  const generatePDF = (job: ProcessingJob): string => {
    return `AI MULTIMEDIA PRODUCTION SUITE - PROCESSING REPORT

Job Information:
- Job ID: ${job.id}
- File Name: ${job.fileName}
- Status: ${job.status}
- Progress: ${job.progress}%
- Generated: ${new Date().toLocaleString()}

Processing Results:
${Object.entries(job.results)
  .map(
    ([agentId, results]) => `
${agentId.toUpperCase()}:
${Object.entries(results)
  .map(([key, value]) => `  • ${key}: ${value}`)
  .join("\n")}
`,
  )
  .join("\n")}

---
Generated by AI Multimedia Production Suite
`
  }

  const generateZIP = (job: ProcessingJob): string => {
    return `ZIP Archive Contents for ${job.fileName}

This archive would contain:
- results.json (${JSON.stringify(job.results).length} bytes)
- results.csv (${generateCSV(job).length} bytes)
- results.xml (${generateXML(job).length} bytes)
- report.pdf (${generatePDF(job).length} bytes)

Total estimated size: ${Math.round((JSON.stringify(job.results).length * 4) / 1024)} KB
`
  }

  const deleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id))
  }

  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "json":
      case "xml":
      case "csv":
        return <FileText className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "zip":
        return <Archive className="h-4 w-4" />
      case "mp4":
      case "avi":
        return <Video className="h-4 w-4" />
      case "mp3":
      case "wav":
        return <Music className="h-4 w-4" />
      case "jpg":
      case "png":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: DownloadItem["status"]) => {
    switch (status) {
      case "preparing":
        return "secondary"
      case "ready":
        return "default"
      case "downloading":
        return "default"
      case "completed":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Download Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Download</CardTitle>
          <CardDescription>Generate downloads for completed jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs
              .filter((job) => job.status === "completed")
              .map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{job.fileName}</h4>
                      <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["json", "csv", "xml", "pdf", "zip"].map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => generateDownload(job, format)}
                          disabled={isGenerating === job.id}
                        >
                          {getFileIcon(format)}
                          <span className="ml-1">{format.toUpperCase()}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Download Queue</CardTitle>
          <CardDescription>Manage your generated downloads</CardDescription>
        </CardHeader>
        <CardContent>
          {downloads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No downloads generated yet. Use the quick download options above.
            </div>
          ) : (
            <div className="space-y-4">
              {downloads.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(item.format)}
                    <div>
                      <p className="font-medium">{item.fileName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>Expires {item.expiresAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                      {(item.status === "preparing" || item.status === "downloading") && (
                        <div className="w-24">
                          <Progress value={item.progress} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {item.status === "ready" && (
                        <Button size="sm" onClick={() => downloadFile(item)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {item.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => downloadFile(item)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-download
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => deleteDownload(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
