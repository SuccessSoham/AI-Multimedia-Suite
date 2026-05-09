"use client"

import { useEffect, useState } from "react"

export function NeuralPulse() {
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setPulses((prev) => [
        ...prev.slice(-10),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      ])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0a0a0f]">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: `linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />

      {/* Pulses */}
      {pulses.map((pulse) => (
        <div
          key={pulse.id}
          className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${pulse.x}%`,
            top: `${pulse.y}%`,
            background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
            animation: 'neural-pulse 4s ease-out forwards'
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes neural-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
