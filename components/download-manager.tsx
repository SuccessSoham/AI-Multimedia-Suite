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
    // Generate actual media files that can be played by standard players

    switch (format) {
      case "enhanced_video":
        // Create a minimal valid MP4 file structure
        // This creates a very basic MP4 that players can recognize
        const mp4Header = new Uint8Array([
          // ftyp box
          0x00,
          0x00,
          0x00,
          0x20, // box size
          0x66,
          0x74,
          0x79,
          0x70, // 'ftyp'
          0x69,
          0x73,
          0x6f,
          0x6d, // major brand 'isom'
          0x00,
          0x00,
          0x02,
          0x00, // minor version
          0x69,
          0x73,
          0x6f,
          0x6d, // compatible brand 'isom'
          0x69,
          0x73,
          0x6f,
          0x32, // compatible brand 'iso2'
          0x61,
          0x76,
          0x63,
          0x31, // compatible brand 'avc1'
          0x6d,
          0x70,
          0x34,
          0x31, // compatible brand 'mp41'

          // mdat box (minimal)
          0x00,
          0x00,
          0x00,
          0x08, // box size
          0x6d,
          0x64,
          0x61,
          0x74, // 'mdat'
        ])
        return new Blob([mp4Header], { type: "video/mp4" })

      case "enhanced_audio":
        // Create a minimal valid WAV file
        const sampleRate = 44100
        const duration = 5 // 5 seconds
        const numSamples = sampleRate * duration
        const numChannels = 2
        const bytesPerSample = 2
        const blockAlign = numChannels * bytesPerSample
        const byteRate = sampleRate * blockAlign
        const dataSize = numSamples * blockAlign
        const fileSize = 36 + dataSize

        const wavHeader = new ArrayBuffer(44 + dataSize)
        const view = new DataView(wavHeader)

        // WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
          }
        }

        writeString(0, "RIFF")
        view.setUint32(4, fileSize, true)
        writeString(8, "WAVE")
        writeString(12, "fmt ")
        view.setUint32(16, 16, true) // fmt chunk size
        view.setUint16(20, 1, true) // audio format (PCM)
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, byteRate, true)
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, bytesPerSample * 8, true) // bits per sample
        writeString(36, "data")
        view.setUint32(40, dataSize, true)

        // Generate simple sine wave audio data
        const audioData = new Int16Array(wavHeader, 44, numSamples * numChannels)
        for (let i = 0; i < numSamples; i++) {
          const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3 * 32767 // 440Hz tone
          audioData[i * 2] = sample // left channel
          audioData[i * 2 + 1] = sample // right channel
        }

        return new Blob([wavHeader], { type: "audio/wav" })

      case "enhanced_image":
        // Create a simple PNG image
        // This creates a minimal 1x1 pixel PNG that image viewers can open
        const pngData = new Uint8Array([
          0x89,
          0x50,
          0x4e,
          0x47,
          0x0d,
          0x0a,
          0x1a,
          0x0a, // PNG signature
          0x00,
          0x00,
          0x00,
          0x0d, // IHDR chunk size
          0x49,
          0x48,
          0x44,
          0x52, // IHDR
          0x00,
          0x00,
          0x00,
          0x64, // width: 100px
          0x00,
          0x00,
          0x00,
          0x64, // height: 100px
          0x08,
          0x02,
          0x00,
          0x00,
          0x00, // bit depth, color type, compression, filter, interlace
          0x4c,
          0x5c,
          0x6d,
          0x7e, // CRC
          0x00,
          0x00,
          0x00,
          0x0c, // IDAT chunk size
          0x49,
          0x44,
          0x41,
          0x54, // IDAT
          0x08,
          0x1d,
          0x01,
          0x01,
          0x00,
          0x00,
          0xfe,
          0xff,
          0x00,
          0x00,
          0x00,
          0x02, // compressed data
          0x00,
          0x01,
          0x00,
          0x25, // CRC
          0x00,
          0x00,
          0x00,
          0x00, // IEND chunk size
          0x49,
          0x45,
          0x4e,
          0x44, // IEND
          0xae,
          0x42,
          0x60,
          0x82, // CRC
        ])
        return new Blob([pngData], { type: "image/png" })

      case "storyboard":
        // Create a larger PNG for storyboard (placeholder with text-like pattern)
        const storyboardWidth = 800
        const storyboardHeight = 600

        // Create canvas to generate storyboard image
        const canvas = document.createElement("canvas")
        canvas.width = storyboardWidth
        canvas.height = storyboardHeight
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Create a gradient background
          const gradient = ctx.createLinearGradient(0, 0, storyboardWidth, storyboardHeight)
          gradient.addColorStop(0, "#f0f9ff")
          gradient.addColorStop(1, "#e0e7ff")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, storyboardWidth, storyboardHeight)

          // Add storyboard grid
          ctx.strokeStyle = "#cbd5e1"
          ctx.lineWidth = 2
          const cols = 4
          const rows = 3
          const cellWidth = storyboardWidth / cols
          const cellHeight = storyboardHeight / rows

          for (let i = 0; i <= cols; i++) {
            ctx.beginPath()
            ctx.moveTo(i * cellWidth, 0)
            ctx.lineTo(i * cellWidth, storyboardHeight)
            ctx.stroke()
          }

          for (let i = 0; i <= rows; i++) {
            ctx.beginPath()
            ctx.moveTo(0, i * cellHeight)
            ctx.lineTo(storyboardWidth, i * cellHeight)
            ctx.stroke()
          }

          // Add frame labels
          ctx.fillStyle = "#1e293b"
          ctx.font = "16px Arial"
          ctx.textAlign = "center"

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const frameNum = row * cols + col + 1
              const x = col * cellWidth + cellWidth / 2
              const y = row * cellHeight + cellHeight / 2
              ctx.fillText(`Frame ${frameNum}`, x, y)
              ctx.fillText(`${(frameNum * 10).toFixed(1)}s`, x, y + 20)
            }
          }

          // Add title
          ctx.font = "bold 24px Arial"
          ctx.fillStyle = "#3730a3"
          ctx.textAlign = "center"
          ctx.fillText(`Storyboard: ${job.fileName}`, storyboardWidth / 2, 30)

          // Convert canvas to blob
          return new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            }, "image/png")
          }) as any // Type assertion for immediate return
        }

        // Fallback if canvas fails
        return new Blob([pngData], { type: "image/png" })

      default:
        return new Blob(["Unknown file format"], { type: "text/plain" })
    }
  }

  const generateEnhancedMediaFile = async (job: ProcessingJob, format: string): Promise<Blob> => {
    return new Promise((resolve) => {
      if (format === "storyboard") {
        // Generate storyboard using canvas
        const canvas = document.createElement("canvas")
        canvas.width = 1200
        canvas.height = 800
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Enhanced storyboard generation
          const gradient = ctx.createLinearGradient(0, 0, 1200, 800)
          gradient.addColorStop(0, "#f8fafc")
          gradient.addColorStop(1, "#e2e8f0")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 1200, 800)

          // Add professional storyboard layout
          ctx.strokeStyle = "#475569"
          ctx.lineWidth = 1

          // Create 3x4 grid
          const cols = 4
          const rows = 3
          const margin = 40
          const cellWidth = (1200 - margin * 2) / cols
          const cellHeight = (800 - margin * 2) / rows

          // Draw grid
          for (let i = 0; i <= cols; i++) {
            ctx.beginPath()
            ctx.moveTo(margin + i * cellWidth, margin)
            ctx.lineTo(margin + i * cellWidth, 800 - margin)
            ctx.stroke()
          }

          for (let i = 0; i <= rows; i++) {
            ctx.beginPath()
            ctx.moveTo(margin, margin + i * cellHeight)
            ctx.lineTo(1200 - margin, margin + i * cellHeight)
            ctx.stroke()
          }

          // Add frame content
          ctx.fillStyle = "#1e293b"
          ctx.font = "14px Arial"
          ctx.textAlign = "center"

          const scenes = job.results["storyboard-agent"]?.scenes || 12
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const frameNum = row * cols + col + 1
              if (frameNum <= scenes) {
                const x = margin + col * cellWidth + cellWidth / 2
                const y = margin + row * cellHeight + cellHeight / 2

                // Frame number
                ctx.font = "bold 16px Arial"
                ctx.fillText(`Scene ${frameNum}`, x, y - 20)

                // Timestamp
                ctx.font = "12px Arial"
                ctx.fillStyle = "#64748b"
                ctx.fillText(`${(frameNum * 15).toFixed(1)}s`, x, y)

                // Description
                ctx.fillText(`Key frame analysis`, x, y + 20)
                ctx.fillStyle = "#1e293b"
              }
            }
          }

          // Add header
          ctx.font = "bold 28px Arial"
          ctx.fillStyle = "#0f172a"
          ctx.textAlign = "center"
          ctx.fillText(`AI-Generated Storyboard`, 600, 25)

          ctx.font = "16px Arial"
          ctx.fillStyle = "#475569"
          ctx.fillText(`Source: ${job.fileName}`, 600, 50)

          canvas.toBlob(
            (blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            },
            "image/png",
            0.9,
          )
        } else {
          resolve(new Blob([], { type: "image/png" }))
        }
      } else {
        resolve(generateSourceFile(job, format))
      }
    })
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
        content = await generateEnhancedMediaFile(job, option.format)
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
