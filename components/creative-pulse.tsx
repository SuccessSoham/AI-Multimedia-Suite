"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Image as ImageIcon, Music, Type } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CreativePulseProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
}

export function CreativePulse({ onGenerate, isLoading }: CreativePulseProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt)
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-background/50 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="pulse-prompt" className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Creative Pulse
            </label>
            <div className="relative">
              <Input
                id="pulse-prompt"
                placeholder="e.g., Cyberpunk rock theme with neon lights..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="pr-24 h-14 text-lg bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="absolute right-1.5 top-1.5 h-11 px-6 gap-2"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <Zap className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Invoke
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              FLUX.1 Image
            </div>
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              MusicGen Melody
            </div>
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Whisper V3
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
