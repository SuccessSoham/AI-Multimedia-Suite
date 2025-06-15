"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileVideo, FileAudio, ImageIcon, File } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export function FileUploader({ onFileUpload, isProcessing }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="h-8 w-8" />
    if (file.type.startsWith("audio/")) return <FileAudio className="h-8 w-8" />
    if (file.type.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Media File</CardTitle>
          <CardDescription>Upload a video, audio, or image file to start the AI processing pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">Drop your file here, or click to browse</p>
            <p className="text-sm text-slate-500 mb-4">Supports video, audio, and image files</p>
            <input
              type="file"
              accept="video/*,audio/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" disabled={isProcessing} className="cursor-pointer">
                Browse Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Selected File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
              {getFileIcon(selectedFile)}
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <Button onClick={() => onFileUpload(selectedFile)} disabled={isProcessing} className="ml-auto">
                {isProcessing ? "Processing..." : "Start Processing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Processing Pipeline</CardTitle>
          <CardDescription>Your file will be processed through the following agents:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Metadata Extraction</p>
                <p className="text-sm text-slate-600">OCR, tags, content analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Video Enhancement</p>
                <p className="text-sm text-slate-600">Upscaling, noise reduction, color correction</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Audio Optimization</p>
                <p className="text-sm text-slate-600">Noise reduction, enhancement, transcription</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Storyboard Generation</p>
                <p className="text-sm text-slate-600">Scene analysis, key frames, timeline</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
