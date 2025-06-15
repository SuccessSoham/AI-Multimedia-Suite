"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import type { ProcessingJob } from "@/app/page"

interface DownloadManagerProps {
  jobs: ProcessingJob[]
}

export function DownloadManager({ jobs }: DownloadManagerProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleQuickDownload = async (job: ProcessingJob, format: string) => {
    setIsGenerating(job.id)

    // Simulate generation time
    await new Promise((resolve) => setTimeout(resolve, 1000))

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
            csv += `${agentId},${key},${value}\n`
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

    // Trigger download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsGenerating(null)
  }

  const completedJobs = jobs.filter((job) => job.status === "completed")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Manager</CardTitle>
        <CardDescription>Download processing results in various formats</CardDescription>
      </CardHeader>
      <CardContent>
        {completedJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No completed jobs available for download.</div>
        ) : (
          <div className="space-y-4">
            {completedJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{job.fileName}</p>
                    <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickDownload(job, "json")}
                    disabled={isGenerating === job.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating === job.id ? "Generating..." : "JSON"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickDownload(job, "csv")}
                    disabled={isGenerating === job.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
