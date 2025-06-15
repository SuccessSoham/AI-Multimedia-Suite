"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Video, Music, ImageIcon, Archive, FileCode, FileSpreadsheet } from "lucide-react"
import type { ProcessingJob } from "@/app/page"

interface DownloadManagerProps {
  jobs: ProcessingJob[]
}

interface DownloadOption {
  format: string
  label: string
  icon: React.ReactNode
  description: string
  category: "source" | "data" | "archive"
  mimeType: string
  fileExtension: string
}

export function DownloadManager({ jobs }: DownloadManagerProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const getDownloadOptions = (job: ProcessingJob): DownloadOption[] => {
    const options: DownloadOption[] = []

    // Source file options based on original file type
    if (job.fileType.startsWith("video/")) {
      options.push({
        format: "enhanced_video",
        label: "Enhanced Video",
        icon: <Video className="h-4 w-4" />,
        description: "AI-enhanced video with improvements",
        category: "source",
        mimeType: "video/mp4",
        fileExtension: "mp4",
      })

      // If video has audio, offer enhanced audio separately
      options.push({
        format: "enhanced_audio",
        label: "Enhanced Audio",
        icon: <Music className="h-4 w-4" />,
        description: "Extracted and optimized audio track",
        category: "source",
        mimeType: "audio/mp3",
        fileExtension: "mp3",
      })
    } else if (job.fileType.startsWith("audio/")) {
      options.push({
        format: "enhanced_audio",
        label: "Enhanced Audio",
        icon: <Music className="h-4 w-4" />,
        description: "AI-optimized audio with noise reduction",
        category: "source",
        mimeType: "audio/wav",
        fileExtension: "wav",
      })
    } else if (job.fileType.startsWith("image/")) {
      options.push({
        format: "enhanced_image",
        label: "Enhanced Image",
        icon: <ImageIcon className="h-4 w-4" />,
        description: "AI-enhanced image with improvements",
        category: "source",
        mimeType: "image/png",
        fileExtension: "png",
      })
    }

    // Storyboard files (if video processing)
    if (job.fileType.startsWith("video/") && job.results["storyboard-agent"]) {
      options.push({
        format: "storyboard",
        label: "Storyboard",
        icon: <ImageIcon className="h-4 w-4" />,
        description: "Generated storyboard with key frames",
        category: "source",
        mimeType: "image/png",
        fileExtension: "png",
      })
    }

    // Data export options
    options.push(
      {
        format: "json",
        label: "JSON Data",
        icon: <FileCode className="h-4 w-4" />,
        description: "Complete processing results in JSON format",
        category: "data",
        mimeType: "application/json",
        fileExtension: "json",
      },
      {
        format: "csv",
        label: "CSV Data",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        description: "Processing metrics in spreadsheet format",
        category: "data",
        mimeType: "text/csv",
        fileExtension: "csv",
      },
      {
        format: "xml",
        label: "XML Data",
        icon: <FileText className="h-4 w-4" />,
        description: "Structured data in XML format",
        category: "data",
        mimeType: "application/xml",
        fileExtension: "xml",
      },
    )

    // Archive option
    options.push({
      format: "complete_package",
      label: "Complete Package",
      icon: <Archive className="h-4 w-4" />,
      description: "All files and data in one ZIP archive",
      category: "archive",
      mimeType: "application/zip",
      fileExtension: "zip",
    })

    return options
  }

  const generateSourceFile = (job: ProcessingJob, format: string): Blob => {
    // In a real implementation, these would be the actual processed files
    // For demo purposes, we'll create mock files with realistic content

    switch (format) {
      case "enhanced_video":
        // Create a mock video file (in reality, this would be the processed video)
        const videoContent = `Enhanced Video File: ${job.fileName}
Processing Results:
- Resolution: ${job.results["video-agent"]?.resolution || "4K Enhanced"}
- Noise Reduction: ${job.results["video-agent"]?.noiseReduction || "85% improvement"}
- Color Correction: ${job.results["video-agent"]?.colorCorrection || "Applied"}
- Scenes Detected: ${job.results["video-agent"]?.scenes || 12}

This would be the actual enhanced video file in a real implementation.
File size would be significantly larger (hundreds of MB to GB).
`
        return new Blob([videoContent], { type: "text/plain" }) // Mock as text for demo

      case "enhanced_audio":
        const audioContent = `Enhanced Audio File: ${job.fileName}
Processing Results:
- Noise Reduction: ${job.results["audio-agent"]?.noiseReduction || "92% improvement"}
- Audio Quality: ${job.results["audio-agent"]?.audioQuality || "Enhanced to 48kHz"}
- Speech-to-Text: ${job.results["audio-agent"]?.speechToText || "Available"}

This would be the actual enhanced audio file in a real implementation.
`
        return new Blob([audioContent], { type: "text/plain" }) // Mock as text for demo

      case "enhanced_image":
        const imageContent = `Enhanced Image File: ${job.fileName}
Processing Results:
- Objects Detected: ${job.results["metadata-agent"]?.objects || 15}
- Tags: ${job.results["metadata-agent"]?.tags?.join(", ") || "Various"}

This would be the actual enhanced image file in a real implementation.
`
        return new Blob([imageContent], { type: "text/plain" }) // Mock as text for demo

      case "storyboard":
        const storyboardContent = `Storyboard File: ${job.fileName}
Key Frames: ${job.results["storyboard-agent"]?.keyFrames || 24}
Scenes: ${job.results["storyboard-agent"]?.scenes || 12}
Transitions: ${job.results["storyboard-agent"]?.transitions || 11}

This would be the actual storyboard image file in a real implementation.
`
        return new Blob([storyboardContent], { type: "text/plain" }) // Mock as text for demo

      default:
        return new Blob(["Unknown file format"], { type: "text/plain" })
    }
  }

  const handleDownload = async (job: ProcessingJob, option: DownloadOption) => {
    setIsGenerating(`${job.id}-${option.format}`)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let content: string | Blob
      let filename: string
      let mimeType: string

      if (option.category === "source") {
        // Generate source file
        content = generateSourceFile(job, option.format)
        filename = `${job.fileName.split(".")[0]}_${option.format}.${option.fileExtension}`
        mimeType = option.mimeType
      } else if (option.format === "complete_package") {
        // Generate complete package
        const packageContent = generateCompletePackage(job)
        content = packageContent
        filename = `${job.fileName.split(".")[0]}_complete_package.zip`
        mimeType = "application/zip"
      } else {
        // Generate data files
        switch (option.format) {
          case "json":
            content = JSON.stringify(
              {
                job: {
                  id: job.id,
                  fileName: job.fileName,
                  fileType: job.fileType,
                  status: job.status,
                  progress: job.progress,
                },
                results: job.results,
                metadata: {
                  downloadedAt: new Date().toISOString(),
                  format: "JSON",
                  version: "2.0",
                },
              },
              null,
              2,
            )
            break
          case "csv":
            let csv = "Agent,Metric,Value\n"
            csv += `Metadata,Job ID,${job.id}\n`
            csv += `Metadata,File Name,${job.fileName}\n`
            csv += `Metadata,File Type,${job.fileType}\n`
            csv += `Metadata,Status,${job.status}\n`
            csv += `Metadata,Progress,${job.progress}%\n`
            Object.entries(job.results).forEach(([agentId, results]) => {
              Object.entries(results).forEach(([key, value]) => {
                csv += `${agentId},${key},${value}\n`
              })
            })
            content = csv
            break
          case "xml":
            content = generateXML(job)
            break
          default:
            content = JSON.stringify(job.results, null, 2)
        }

        filename = `${job.fileName.split(".")[0]}_${option.format}.${option.fileExtension}`
        mimeType = option.mimeType
      }

      // Trigger download
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
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
      setIsGenerating(null)
    }
  }

  const generateXML = (job: ProcessingJob): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<ProcessingResults>\n'
    xml += `  <Job id="${job.id}" fileName="${job.fileName}" fileType="${job.fileType}" status="${job.status}" progress="${job.progress}"/>\n`
    xml += "  <Results>\n"
    Object.entries(job.results).forEach(([agentId, results]) => {
      xml += `    <Agent id="${agentId}">\n`
      Object.entries(results).forEach(([key, value]) => {
        xml += `      <${key}>${value}</${key}>\n`
      })
      xml += "    </Agent>\n"
    })
    xml += "  </Results>\n"
    xml += `  <Metadata downloadedAt="${new Date().toISOString()}" format="XML"/>\n`
    xml += "</ProcessingResults>"
    return xml
  }

  const generateCompletePackage = (job: ProcessingJob): Blob => {
    // In a real implementation, this would create a proper ZIP file
    // For demo, we'll create a text representation
    const packageContent = `Complete Package for: ${job.fileName}
Job ID: ${job.id}

This package would contain:
1. Enhanced source files (video/audio/image)
2. Processing data (JSON, CSV, XML)
3. Storyboard files (if applicable)
4. Processing reports
5. Metadata and logs

Total estimated size: ${Math.round(Math.random() * 500 + 100)} MB

Generated: ${new Date().toISOString()}
`
    return new Blob([packageContent], { type: "text/plain" })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "source":
        return "bg-blue-100 text-blue-800"
      case "data":
        return "bg-green-100 text-green-800"
      case "archive":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const completedJobs = jobs.filter((job) => job.status === "completed")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Manager</CardTitle>
        <CardDescription>Download enhanced files and processing results in various formats</CardDescription>
      </CardHeader>
      <CardContent>
        {completedJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No completed jobs available for download.</div>
        ) : (
          <div className="space-y-6">
            {completedJobs.map((job) => {
              const downloadOptions = getDownloadOptions(job)
              const sourceOptions = downloadOptions.filter((opt) => opt.category === "source")
              const dataOptions = downloadOptions.filter((opt) => opt.category === "data")
              const archiveOptions = downloadOptions.filter((opt) => opt.category === "archive")

              return (
                <Card key={job.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{job.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Job ID: {job.id} • Type: {job.fileType}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced Source Files */}
                    {sourceOptions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          Enhanced Source Files
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {sourceOptions.map((option) => (
                            <div key={option.format} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {option.icon}
                                  <span className="font-medium text-sm">{option.label}</span>
                                </div>
                                <Badge variant="outline" className={getCategoryColor(option.category)}>
                                  {option.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{option.description}</p>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleDownload(job, option)}
                                disabled={isGenerating === `${job.id}-${option.format}`}
                              >
                                <Download className="h-3 w-3 mr-2" />
                                {isGenerating === `${job.id}-${option.format}` ? "Generating..." : "Download"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Export Options */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Processing Data
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {dataOptions.map((option) => (
                          <div key={option.format} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {option.icon}
                                <span className="font-medium text-sm">{option.label}</span>
                              </div>
                              <Badge variant="outline" className={getCategoryColor(option.category)}>
                                {option.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{option.description}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDownload(job, option)}
                              disabled={isGenerating === `${job.id}-${option.format}`}
                            >
                              <Download className="h-3 w-3 mr-2" />
                              {isGenerating === `${job.id}-${option.format}` ? "Generating..." : "Download"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Complete Package */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Archive className="h-4 w-4 mr-2" />
                        Complete Package
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {archiveOptions.map((option) => (
                          <div
                            key={option.format}
                            className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {option.icon}
                                <span className="font-medium">{option.label}</span>
                              </div>
                              <Badge variant="outline" className={getCategoryColor(option.category)}>
                                {option.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                            <Button
                              size="lg"
                              className="w-full"
                              onClick={() => handleDownload(job, option)}
                              disabled={isGenerating === `${job.id}-${option.format}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isGenerating === `${job.id}-${option.format}`
                                ? "Preparing Package..."
                                : "Download Complete Package"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
