"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LogEntry {
  id: string
  timestamp: Date
  source: string
  message: string
  type: "info" | "error" | "success" | "raw"
  data?: any
}

interface JarvisConsoleProps {
  logs: LogEntry[]
}

export function JarvisConsole({ logs }: JarvisConsoleProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t bg-black/90 backdrop-blur-xl text-green-400 font-mono text-xs",
        isMinimized ? "h-10" : "h-64"
      )}
    >
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-bold tracking-wider">JARVIS CONSOLE</span>
          <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 rounded text-[10px] animate-pulse">LIVE FEED</span>
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="hover:bg-white/10 p-1 rounded"
        >
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      {!isMinimized && (
        <ScrollArea className="h-[calc(100%-40px)] p-4">
          <div className="space-y-1.5" ref={scrollRef}>
            {logs.length === 0 && (
              <div className="opacity-50 italic">Waiting for creative pulse initialization...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start group">
                <span className="opacity-30 shrink-0">
                  [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span className={cn(
                  "shrink-0 font-bold",
                  log.type === "error" ? "text-red-400" : 
                  log.type === "success" ? "text-blue-400" : 
                  "text-green-500"
                )}>
                  {log.source}:
                </span>
                <div className="flex-1 space-y-1">
                  <span className={cn(
                    log.type === "error" && "text-red-300",
                    log.type === "success" && "text-blue-300"
                  )}>
                    {log.message}
                  </span>
                  {log.data && (
                    <pre className="mt-1 p-2 bg-white/5 rounded overflow-x-auto text-[10px] text-green-300/70 border border-white/5">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
