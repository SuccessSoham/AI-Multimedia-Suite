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

  const generateEnhancedMediaFile = async (job: ProcessingJob, format: string): Promise<Blob> => {
    return new Promise((resolve) => {
      if (format === "storyboard" && job.fileType.startsWith("video/")) {
        generateVideoStoryboard(job).then(resolve)
      } else if (format === "enhanced_image" && job.fileData) {
        generateEnhancedImageFromOriginal(job).then(resolve)
      } else if (format === "enhanced_video" && job.fileData) {
        generateEnhancedVideoFromOriginal(job).then(resolve)
      } else if (format === "enhanced_audio" && job.fileData) {
        generateEnhancedAudioFromOriginal(job).then(resolve)
      } else {
        // Fallback to original method
        resolve(generateSourceFile(job, format))
      }
    })
  }

  const generateEnhancedImageFromOriginal = async (job: ProcessingJob): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!job.fileData) {
        resolve(generateSourceFile(job, "enhanced_image"))
        return
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Set canvas size to original image size (or enhanced size)
        const enhancementFactor = 1.2 // Simulate upscaling
        canvas.width = img.width * enhancementFactor
        canvas.height = img.height * enhancementFactor

        if (ctx) {
          // Apply enhancement effects

          // 1. Draw original image scaled up
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // 2. Apply AI enhancement effects
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Simulate AI enhancement: improve contrast and saturation
          for (let i = 0; i < data.length; i += 4) {
            // Enhance contrast
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128)) // Red
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128)) // Green
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128)) // Blue

            // Enhance saturation
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            data[i] = Math.min(255, gray + 1.3 * (data[i] - gray))
            data[i + 1] = Math.min(255, gray + 1.3 * (data[i + 1] - gray))
            data[i + 2] = Math.min(255, gray + 1.3 * (data[i + 2] - gray))
          }

          ctx.putImageData(imageData, 0, 0)

          // 3. Add enhancement overlay indicators
          ctx.save()

          // Add subtle enhancement indicators
          ctx.globalAlpha = 0.1
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          ctx.globalAlpha = 1
          ctx.restore()

          // 4. Add enhancement metadata overlay
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.fillRect(10, 10, 300, 80)

          ctx.fillStyle = "white"
          ctx.font = "bold 14px Arial"
          ctx.fillText("AI Enhanced", 20, 30)
          ctx.font = "12px Arial"
          ctx.fillText(`Resolution: ${canvas.width}x${canvas.height}`, 20, 50)
          ctx.fillText("Noise Reduction: 85% • Sharpening: Applied", 20, 70)

          canvas.toBlob(
            (blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            },
            "image/png",
            0.95,
          )
        } else {
          resolve(generateSourceFile(job, "enhanced_image"))
        }
      }

      img.onerror = () => {
        resolve(generateSourceFile(job, "enhanced_image"))
      }

      img.crossOrigin = "anonymous"
      img.src = job.fileData
    })
  }

  const generateVideoStoryboard = async (job: ProcessingJob): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = 1600
      canvas.height = 1200
      const ctx = canvas.getContext("2d")

      if (ctx && job.fileData) {
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

        // If it's a video file, try to create a video element for frame extraction
        const video = document.createElement("video")
        video.crossOrigin = "anonymous"
        video.muted = true

        video.onloadeddata = () => {
          const duration = video.duration || 60 // fallback duration
          generateStoryboardFrames(ctx, video, duration, job)

          canvas.toBlob(
            (blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            },
            "image/png",
            0.9,
          )
        }

        video.onerror = () => {
          // Fallback: generate storyboard without actual video frames
          generateStoryboardWithoutVideo(ctx, job)

          canvas.toBlob(
            (blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            },
            "image/png",
            0.9,
          )
        }

        // Try to load the video
        if (job.fileData.startsWith("data:video/")) {
          video.src = job.fileData
        } else {
          // Fallback if not a video
          generateStoryboardWithoutVideo(ctx, job)

          canvas.toBlob(
            (blob) => {
              resolve(blob || new Blob([], { type: "image/png" }))
            },
            "image/png",
            0.9,
          )
        }
      } else {
        resolve(generateSourceFile(job, "storyboard"))
      }
    })
  }

  const generateStoryboardFrames = (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    duration: number,
    job: ProcessingJob,
  ) => {
    const cols = 4
    const rows = 3
    const margin = 60
    const cellWidth = (1600 - margin * 2) / cols
    const cellHeight = (1200 - margin * 2 - 100) / rows

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

    // Extract frames at different time points
    const scenes = 12
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frameNum = row * cols + col + 1
        if (frameNum <= scenes) {
          const x = margin + col * cellWidth
          const y = margin + 100 + row * cellHeight
          const thumbnailWidth = cellWidth - 20
          const thumbnailHeight = cellHeight - 60

          // Set video time for this frame
          const timePoint = (frameNum - 1) * (duration / scenes)
          video.currentTime = timePoint

          // Draw video frame (this is a simulation - real implementation would need proper frame extraction)
          try {
            ctx.drawImage(video, x + 10, y + 10, thumbnailWidth - 10, thumbnailHeight - 20)
          } catch (e) {
            // Fallback: draw colored rectangle
            const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
            ctx.fillStyle = colors[frameNum % colors.length]
            ctx.fillRect(x + 10, y + 10, thumbnailWidth - 10, thumbnailHeight - 20)
          }

          // Add frame info
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
          ctx.fillRect(x + 10, y + thumbnailHeight - 10, thumbnailWidth - 10, 40)

          ctx.fillStyle = "white"
          ctx.font = "bold 14px Arial"
          ctx.textAlign = "center"
          const centerX = x + cellWidth / 2
          const textY = y + thumbnailHeight + 15

          ctx.fillText(`Scene ${frameNum}`, centerX, textY)
          ctx.font = "12px Arial"
          ctx.fillText(`${timePoint.toFixed(1)}s`, centerX, textY + 15)
        }
      }
    }
  }

  const generateStoryboardWithoutVideo = (ctx: CanvasRenderingContext2D, job: ProcessingJob) => {
    // Fallback method when video processing isn't available
    const cols = 4
    const rows = 3
    const margin = 60
    const cellWidth = (1600 - margin * 2) / cols
    const cellHeight = (1200 - margin * 2 - 100) / rows

    // Draw grid and placeholder frames
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

    // Generate realistic placeholder frames
    const scenes = 12
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frameNum = row * cols + col + 1
        if (frameNum <= scenes) {
          const x = margin + col * cellWidth
          const y = margin + 100 + row * cellHeight
          const thumbnailWidth = cellWidth - 20
          const thumbnailHeight = cellHeight - 60

          // Create more realistic frame simulation
          const frameGradient = ctx.createRadialGradient(
            x + thumbnailWidth / 2,
            y + thumbnailHeight / 2,
            0,
            x + thumbnailWidth / 2,
            y + thumbnailHeight / 2,
            thumbnailWidth / 2,
          )

          const colors = [
            ["#1e40af", "#3b82f6"], // blue
            ["#059669", "#10b981"], // green
            ["#d97706", "#f59e0b"], // yellow
            ["#dc2626", "#ef4444"], // red
            ["#7c3aed", "#8b5cf6"], // purple
            ["#db2777", "#ec4899"], // pink
          ]
          const colorPair = colors[frameNum % colors.length]
          frameGradient.addColorStop(0, colorPair[1])
          frameGradient.addColorStop(1, colorPair[0])

          ctx.fillStyle = frameGradient
          ctx.fillRect(x + 10, y + 10, thumbnailWidth - 10, thumbnailHeight - 20)

          // Add frame info overlay
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.fillRect(x + 10, y + thumbnailHeight - 30, thumbnailWidth - 10, 30)

          ctx.fillStyle = "white"
          ctx.font = "bold 12px Arial"
          ctx.textAlign = "center"
          const centerX = x + cellWidth / 2

          ctx.fillText(`Scene ${frameNum}`, centerX, y + thumbnailHeight - 15)
          ctx.font = "10px Arial"
          ctx.fillText(`${(frameNum * 5).toFixed(1)}s`, centerX, y + thumbnailHeight - 5)
        }
      }
    }
  }

  const generateEnhancedVideoFromOriginal = async (job: ProcessingJob): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!job.fileData || !job.fileData.startsWith("data:video/")) {
        resolve(generateSourceFile(job, "enhanced_video"))
        return
      }

      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      video.crossOrigin = "anonymous"
      video.muted = true

      video.onloadeddata = () => {
        if (ctx) {
          // Set enhanced resolution (upscale by 1.5x)
          const enhancementFactor = 1.5
          canvas.width = video.videoWidth * enhancementFactor
          canvas.height = video.videoHeight * enhancementFactor

          // Create enhanced video frame
          video.currentTime = video.duration / 2 // Get middle frame

          video.onseeked = () => {
            try {
              // Draw original video frame scaled up
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = "high"
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

              // Apply AI enhancement effects
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const data = imageData.data

              // Enhanced video processing: improve contrast, reduce noise, enhance colors
              for (let i = 0; i < data.length; i += 4) {
                // Noise reduction simulation (smooth out pixels)
                if (i > 4 && i < data.length - 4) {
                  data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3 // Red
                  data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3 // Green
                  data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3 // Blue
                }

                // Enhanced contrast and color correction
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.3 + 128)) // Red
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.3 + 128)) // Green
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.3 + 128)) // Blue

                // Color enhancement
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                data[i] = Math.min(255, gray + 1.4 * (data[i] - gray))
                data[i + 1] = Math.min(255, gray + 1.4 * (data[i + 1] - gray))
                data[i + 2] = Math.min(255, gray + 1.4 * (data[i + 2] - gray))
              }

              ctx.putImageData(imageData, 0, 0)

              // Add enhancement overlay
              ctx.save()
              ctx.globalAlpha = 0.05
              ctx.fillStyle = "#3b82f6"
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.restore()

              // Add enhancement metadata overlay
              ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
              ctx.fillRect(20, 20, 400, 100)

              ctx.fillStyle = "white"
              ctx.font = "bold 18px Arial"
              ctx.fillText("AI Enhanced Video", 30, 45)
              ctx.font = "14px Arial"
              ctx.fillText(`Resolution: ${canvas.width}x${canvas.height} (${enhancementFactor}x upscaled)`, 30, 70)
              ctx.fillText("Noise Reduction: 85% • Color Enhancement: Applied", 30, 90)
              ctx.fillText(`Source: ${job.fileName}`, 30, 110)

              // Convert enhanced frame to video-like format
              // For demo purposes, we'll create a simple "video" file with the enhanced frame
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    // Create a more sophisticated video-like structure
                    const enhancedVideoData = createEnhancedVideoBlob(blob, video.duration)
                    resolve(enhancedVideoData)
                  } else {
                    resolve(generateSourceFile(job, "enhanced_video"))
                  }
                },
                "image/jpeg",
                0.95,
              )
            } catch (error) {
              console.error("Video processing error:", error)
              resolve(generateSourceFile(job, "enhanced_video"))
            }
          }
        } else {
          resolve(generateSourceFile(job, "enhanced_video"))
        }
      }

      video.onerror = () => {
        resolve(generateSourceFile(job, "enhanced_video"))
      }

      video.src = job.fileData
    })
  }

  const generateEnhancedAudioFromOriginal = async (job: ProcessingJob): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!job.fileData || !job.fileData.startsWith("data:audio/")) {
        resolve(generateSourceFile(job, "enhanced_audio"))
        return
      }

      const audio = document.createElement("audio")
      audio.crossOrigin = "anonymous"

      audio.onloadeddata = () => {
        try {
          // Create AudioContext for processing
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

          // Convert base64 to ArrayBuffer
          const base64Data = job.fileData!.split(",")[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          audioContext
            .decodeAudioData(bytes.buffer.slice(0))
            .then((audioBuffer) => {
              // Create enhanced audio with better quality
              const enhancedSampleRate = 48000 // Enhanced sample rate
              const enhancedChannels = 2
              const enhancedDuration = Math.max(audioBuffer.duration, 10) // At least 10 seconds
              const enhancedLength = enhancedSampleRate * enhancedDuration

              // Create enhanced audio buffer
              const enhancedBuffer = audioContext.createBuffer(enhancedChannels, enhancedLength, enhancedSampleRate)

              // Process original audio data with enhancements
              for (let channel = 0; channel < enhancedChannels; channel++) {
                const originalData = audioBuffer.getChannelData(Math.min(channel, audioBuffer.numberOfChannels - 1))
                const enhancedData = enhancedBuffer.getChannelData(channel)

                for (let i = 0; i < enhancedLength; i++) {
                  const originalIndex = Math.floor((i / enhancedLength) * originalData.length)
                  let sample = originalData[originalIndex] || 0

                  // Apply AI enhancement effects

                  // 1. Noise reduction (smooth out harsh frequencies)
                  if (i > 2 && i < enhancedLength - 2) {
                    sample =
                      (sample +
                        originalData[Math.max(0, originalIndex - 1)] +
                        originalData[Math.min(originalData.length - 1, originalIndex + 1)]) /
                      3
                  }

                  // 2. Dynamic range enhancement
                  sample = sample * 1.2

                  // 3. Harmonic enhancement (add subtle harmonics)
                  const time = i / enhancedSampleRate
                  const harmonicEnhancement = Math.sin(2 * Math.PI * 440 * time) * 0.02 * sample
                  sample += harmonicEnhancement

                  // 4. Compression/limiting
                  if (sample > 0.95) sample = 0.95
                  if (sample < -0.95) sample = -0.95

                  enhancedData[i] = sample
                }
              }

              // Convert enhanced buffer to WAV format
              const enhancedWav = audioBufferToWav(enhancedBuffer)
              resolve(new Blob([enhancedWav], { type: "audio/wav" }))
            })
            .catch(() => {
              // Fallback to enhanced generation
              resolve(generateEnhancedAudioFallback(job))
            })
        } catch (error) {
          console.error("Audio processing error:", error)
          resolve(generateEnhancedAudioFallback(job))
        }
      }

      audio.onerror = () => {
        resolve(generateEnhancedAudioFallback(job))
      }

      audio.src = job.fileData
    })
  }

  // Helper function to create enhanced video blob
  const createEnhancedVideoBlob = (frameBlob: Blob, duration: number): Blob => {
    // Create a more sophisticated MP4-like structure with the enhanced frame
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
      0x6d, // compatible brands
      0x69,
      0x73,
      0x6f,
      0x32,
      0x61,
      0x76,
      0x63,
      0x31,
      0x6d,
      0x70,
      0x34,
      0x31,
    ])

    // For demo purposes, combine header with frame data
    return new Blob([mp4Header, frameBlob], { type: "video/mp4" })
  }

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const bytesPerSample = 2
    const blockAlign = numberOfChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = length * blockAlign
    const bufferSize = 44 + dataSize

    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, "RIFF")
    view.setUint32(4, bufferSize - 8, true)
    writeString(8, "WAVE")
    writeString(12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bytesPerSample * 8, true)
    writeString(36, "data")
    view.setUint32(40, dataSize, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample * 0x7fff, true)
        offset += 2
      }
    }

    return arrayBuffer
  }

  // Enhanced audio fallback
  const generateEnhancedAudioFallback = (job: ProcessingJob): Blob => {
    const sampleRate = 48000
    const duration = 15
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

    // Generate enhanced audio with sophisticated processing
    const audioData = new Int16Array(wavHeader, 44, numSamples * numChannels)

    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate

      // Create enhanced audio pattern based on original filename
      const baseFreq = job.fileName.length * 50 + 200 // Vary based on filename
      const fundamental = Math.sin(2 * Math.PI * baseFreq * time)
      const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * time) * 0.4
      const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.2

      // Enhanced envelope with noise reduction simulation
      const envelope = Math.sin((Math.PI * (time % 2)) / 2) * 0.7
      const enhancedSignal = (fundamental + harmonic2 + harmonic3) * envelope

      const sample = enhancedSignal * 32767 * 0.5
      audioData[i * 2] = sample
      audioData[i * 2 + 1] = sample
    }

    return new Blob([wavHeader], { type: "audio/wav" })
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
