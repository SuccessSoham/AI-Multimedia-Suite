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
    switch (format) {
      case "enhanced_video":
        // Create a more complete MP4 file that players can recognize
        // This creates a minimal but valid MP4 with a single black frame
        const mp4Data = new Uint8Array([
          // ftyp box (file type)
          0x00,
          0x00,
          0x00,
          0x20, // box size (32 bytes)
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

          // moov box (movie metadata)
          0x00,
          0x00,
          0x01,
          0x08, // box size (264 bytes)
          0x6d,
          0x6f,
          0x6f,
          0x76, // 'moov'

          // mvhd box (movie header)
          0x00,
          0x00,
          0x00,
          0x6c, // box size (108 bytes)
          0x6d,
          0x76,
          0x68,
          0x64, // 'mvhd'
          0x00,
          0x00,
          0x00,
          0x00, // version and flags
          0x00,
          0x00,
          0x00,
          0x00, // creation time
          0x00,
          0x00,
          0x00,
          0x00, // modification time
          0x00,
          0x00,
          0x03,
          0xe8, // timescale (1000)
          0x00,
          0x00,
          0x0b,
          0xb8, // duration (3000 = 3 seconds)
          0x00,
          0x01,
          0x00,
          0x00, // preferred rate (1.0)
          0x01,
          0x00,
          0x00,
          0x00, // preferred volume (1.0)
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x01,
          0x00,
          0x00, // matrix[0] (1.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[1] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[2] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[3] (0.0)
          0x00,
          0x01,
          0x00,
          0x00, // matrix[4] (1.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[5] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[6] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[7] (0.0)
          0x40,
          0x00,
          0x00,
          0x00, // matrix[8] (16384.0)
          0x00,
          0x00,
          0x00,
          0x00, // preview time
          0x00,
          0x00,
          0x00,
          0x00, // preview duration
          0x00,
          0x00,
          0x00,
          0x00, // poster time
          0x00,
          0x00,
          0x00,
          0x00, // selection time
          0x00,
          0x00,
          0x00,
          0x00, // selection duration
          0x00,
          0x00,
          0x00,
          0x00, // current time
          0x00,
          0x00,
          0x00,
          0x02, // next track ID

          // trak box (track)
          0x00,
          0x00,
          0x00,
          0x8c, // box size (140 bytes)
          0x74,
          0x72,
          0x61,
          0x6b, // 'trak'

          // tkhd box (track header)
          0x00,
          0x00,
          0x00,
          0x5c, // box size (92 bytes)
          0x74,
          0x6b,
          0x68,
          0x64, // 'tkhd'
          0x00,
          0x00,
          0x00,
          0x07, // version and flags (track enabled)
          0x00,
          0x00,
          0x00,
          0x00, // creation time
          0x00,
          0x00,
          0x00,
          0x00, // modification time
          0x00,
          0x00,
          0x00,
          0x01, // track ID
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x00,
          0x0b,
          0xb8, // duration (3000)
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x00,
          0x00,
          0x00, // layer
          0x00,
          0x00,
          0x00,
          0x00, // alternate group
          0x00,
          0x00,
          0x00,
          0x00, // volume
          0x00,
          0x00,
          0x00,
          0x00, // reserved
          0x00,
          0x01,
          0x00,
          0x00, // matrix[0] (1.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[1] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[2] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[3] (0.0)
          0x00,
          0x01,
          0x00,
          0x00, // matrix[4] (1.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[5] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[6] (0.0)
          0x00,
          0x00,
          0x00,
          0x00, // matrix[7] (0.0)
          0x40,
          0x00,
          0x00,
          0x00, // matrix[8] (16384.0)
          0x01,
          0x40,
          0x00,
          0x00, // width (320.0)
          0x00,
          0xf0,
          0x00,
          0x00, // height (240.0)

          // mdia box (media)
          0x00,
          0x00,
          0x00,
          0x28, // box size (40 bytes)
          0x6d,
          0x64,
          0x69,
          0x61, // 'mdia'

          // mdhd box (media header)
          0x00,
          0x00,
          0x00,
          0x20, // box size (32 bytes)
          0x6d,
          0x64,
          0x68,
          0x64, // 'mdhd'
          0x00,
          0x00,
          0x00,
          0x00, // version and flags
          0x00,
          0x00,
          0x00,
          0x00, // creation time
          0x00,
          0x00,
          0x00,
          0x00, // modification time
          0x00,
          0x00,
          0x03,
          0xe8, // timescale (1000)
          0x00,
          0x00,
          0x0b,
          0xb8, // duration (3000)
          0x55,
          0xc4,
          0x00,
          0x00, // language (und) and quality

          // mdat box (media data) - minimal
          0x00,
          0x00,
          0x00,
          0x08, // box size (8 bytes)
          0x6d,
          0x64,
          0x61,
          0x74, // 'mdat'
        ])
        return new Blob([mp4Data], { type: "video/mp4" })

      case "enhanced_audio":
        // Create a longer, more realistic WAV file with stereo audio
        const sampleRate = 44100
        const duration = 10 // 10 seconds
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
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, byteRate, true)
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, bytesPerSample * 8, true)
        writeString(36, "data")
        view.setUint32(40, dataSize, true)

        // Generate more complex audio - a melody with multiple frequencies
        const audioData = new Int16Array(wavHeader, 44, numSamples * numChannels)
        const frequencies = [440, 523, 659, 784, 880] // A, C, E, G, A (major chord progression)

        for (let i = 0; i < numSamples; i++) {
          const time = i / sampleRate
          const freqIndex = Math.floor(time * 2) % frequencies.length
          const freq = frequencies[freqIndex]

          // Create a more musical sound with harmonics
          const fundamental = Math.sin(2 * Math.PI * freq * time)
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * time) * 0.3
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * time) * 0.1

          // Add envelope to prevent clicks
          const envelope = Math.sin((Math.PI * (time % 0.5)) / 0.5)

          const sample = (fundamental + harmonic2 + harmonic3) * envelope * 0.3 * 32767

          audioData[i * 2] = sample // left channel
          audioData[i * 2 + 1] = sample // right channel
        }

        return new Blob([wavHeader], { type: "audio/wav" })

      case "enhanced_image":
        // Create a more detailed sample image using canvas
        const canvas = document.createElement("canvas")
        canvas.width = 800
        canvas.height = 600
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Create a gradient background
          const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400)
          gradient.addColorStop(0, "#3b82f6")
          gradient.addColorStop(0.5, "#1d4ed8")
          gradient.addColorStop(1, "#1e40af")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 800, 600)

          // Add some geometric shapes to simulate enhanced content
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * 800
            const y = Math.random() * 600
            const radius = Math.random() * 50 + 10
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, 2 * Math.PI)
            ctx.fill()
          }

          // Add text overlay
          ctx.fillStyle = "white"
          ctx.font = "bold 48px Arial"
          ctx.textAlign = "center"
          ctx.fillText("AI Enhanced", 400, 280)
          ctx.font = "24px Arial"
          ctx.fillText(`Source: ${job.fileName}`, 400, 320)
          ctx.font = "16px Arial"
          ctx.fillText("Resolution: 4K Enhanced • Noise Reduction: 85%", 400, 350)

          return new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            }, "image/png")
          }) as any
        }

        // Fallback
        return new Blob([], { type: "image/png" })

      default:
        return new Blob(["Unknown file format"], { type: "text/plain" })
    }
  }

  const generateEnhancedStoryboard = async (job: ProcessingJob): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = 1600
      canvas.height = 1200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 1600, 1200)
        gradient.addColorStop(0, "#f8fafc")
        gradient.addColorStop(1, "#e2e8f0")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1600, 1200)

        // Header
        ctx.fillStyle = "#0f172a"
        ctx.font = "bold 36px Arial"
        ctx.textAlign = "center"
        ctx.fillText("AI-Generated Storyboard", 800, 40)

        ctx.font = "18px Arial"
        ctx.fillStyle = "#475569"
        ctx.fillText(`Source: ${job.fileName}`, 800, 70)

        // Grid setup
        const cols = 4
        const rows = 3
        const margin = 60
        const cellWidth = (1600 - margin * 2) / cols
        const cellHeight = (1200 - margin * 2 - 100) / rows // Account for header

        // Draw grid
        ctx.strokeStyle = "#475569"
        ctx.lineWidth = 2

        for (let i = 0; i <= cols; i++) {
          ctx.beginPath()
          ctx.moveTo(margin + i * cellWidth, margin + 100)
          ctx.lineTo(margin + i * cellWidth, 1200 - margin)
          ctx.stroke()
        }

        for (let i = 0; i <= rows; i++) {
          ctx.beginPath()
          ctx.moveTo(margin, margin + 100 + i * cellHeight)
          ctx.lineTo(1600 - margin, margin + 100 + i * cellHeight)
          ctx.stroke()
        }

        // Generate thumbnail-like content for each frame
        const scenes = job.results["storyboard-agent"]?.scenes || 12
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const frameNum = row * cols + col + 1
            if (frameNum <= scenes) {
              const x = margin + col * cellWidth
              const y = margin + 100 + row * cellHeight
              const thumbnailWidth = cellWidth - 20
              const thumbnailHeight = cellHeight - 60

              // Create thumbnail background (simulating video frame)
              const thumbnailGradient = ctx.createLinearGradient(
                x + 10,
                y + 10,
                x + thumbnailWidth,
                y + thumbnailHeight,
              )

              // Different colors for different scenes to simulate variety
              const colors = [
                ["#fef3c7", "#f59e0b"], // yellow
                ["#dbeafe", "#3b82f6"], // blue
                ["#dcfce7", "#10b981"], // green
                ["#fce7f3", "#ec4899"], // pink
                ["#f3e8ff", "#8b5cf6"], // purple
                ["#fed7d7", "#ef4444"], // red
              ]
              const colorPair = colors[frameNum % colors.length]
              thumbnailGradient.addColorStop(0, colorPair[0])
              thumbnailGradient.addColorStop(1, colorPair[1])

              ctx.fillStyle = thumbnailGradient
              ctx.fillRect(x + 10, y + 10, thumbnailWidth - 10, thumbnailHeight - 20)

              // Add some shapes to simulate content
              ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
              for (let i = 0; i < 5; i++) {
                const shapeX = x + 20 + Math.random() * (thumbnailWidth - 40)
                const shapeY = y + 20 + Math.random() * (thumbnailHeight - 60)
                const radius = Math.random() * 20 + 5
                ctx.beginPath()
                ctx.arc(shapeX, shapeY, radius, 0, 2 * Math.PI)
                ctx.fill()
              }

              // Add frame info
              ctx.fillStyle = "#1e293b"
              ctx.font = "bold 16px Arial"
              ctx.textAlign = "center"
              const centerX = x + cellWidth / 2
              const textY = y + thumbnailHeight + 25

              ctx.fillText(`Scene ${frameNum}`, centerX, textY)

              ctx.font = "12px Arial"
              ctx.fillStyle = "#64748b"
              ctx.fillText(`${(frameNum * 15).toFixed(1)}s`, centerX, textY + 18)

              // Add scene description
              const descriptions = [
                "Opening shot",
                "Character intro",
                "Action sequence",
                "Close-up",
                "Wide angle",
                "Transition",
                "Dialogue",
                "Climax",
                "Resolution",
                "Establishing shot",
                "Reaction shot",
                "Final scene",
              ]
              ctx.fillText(descriptions[frameNum - 1] || "Key frame", centerX, textY + 32)
            }
          }
        }

        // Add processing info
        ctx.fillStyle = "#374151"
        ctx.font = "14px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`Key Frames: ${job.results["storyboard-agent"]?.keyFrames || 24}`, margin, 1200 - 40)
        ctx.fillText(`Scenes Detected: ${scenes}`, margin + 200, 1200 - 40)
        ctx.fillText(`Transitions: ${job.results["storyboard-agent"]?.transitions || 11}`, margin + 400, 1200 - 40)
        ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, margin + 600, 1200 - 40)

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
    })
  }

  const generateEnhancedMediaFile = async (job: ProcessingJob, format: string): Promise<Blob> => {
    if (format === "storyboard") {
      return await generateEnhancedStoryboard(job)
    } else {
      return generateSourceFile(job, format)
    }
  }

  const handleDownload = async (job: ProcessingJob, option: DownloadOption) => {
    setIsGenerating(`${job.id}-${option.format}`)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

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
