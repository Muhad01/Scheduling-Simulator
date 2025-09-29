"use client"

import { useRef, useEffect } from "react"
import type { Process } from "@/lib/types"

interface GanttChartProps {
  data: { id: number; start: number; end: number; color: string }[]
  processes: Process[]
  currentTime: number
  width: number
  height: number
}

export function GanttChart({ data, processes, currentTime, width, height }: GanttChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Add this helper function at the top of the component
  const isValidNumber = (value: number): boolean => {
    return typeof value === "number" && isFinite(value) && !isNaN(value)
  }

  // Calculate the maximum time to display with safety checks
  let maxTime = 5 // Default minimum value
  if (isValidNumber(currentTime)) {
    maxTime = Math.max(maxTime, currentTime + 5) // Show at least 5 seconds ahead of current time
  }

  // Safely add process end times
  if (data && data.length > 0) {
    const validEndTimes = data.map((item) => item.end).filter(isValidNumber)
    if (validEndTimes.length > 0) {
      maxTime = Math.max(maxTime, ...validEndTimes)
    }
  }

  // Safely add arrival times
  if (processes && processes.length > 0) {
    const validArrivalTimes = processes.map((p) => p.arrivalTime).filter(isValidNumber)
    if (validArrivalTimes.length > 0) {
      maxTime = Math.max(maxTime, ...validArrivalTimes)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background with gradient
    if (isValidNumber(height)) {
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, "#f8fafc") // slate-50
      bgGradient.addColorStop(1, "#f1f5f9") // slate-100
      ctx.fillStyle = bgGradient
    } else {
      ctx.fillStyle = "#f8fafc" // Use solid color as fallback
    }
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    // Ensure we don't divide by zero
    const timeScale = maxTime > 0 ? (width - 100) / maxTime : 1 // 100px for process names
    const processHeight = 40
    const processGap = 10
    const processesHeight = processes.length * (processHeight + processGap)
    const chartTop = 30 // Space for time scale

    // Draw time markers with better styling
    ctx.fillStyle = "#64748b" // slate-500
    ctx.font = "12px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"

    const timeStep = maxTime > 20 ? 5 : maxTime > 10 ? 2 : 1
    for (let t = 0; t <= maxTime; t += timeStep) {
      const x = 100 + t * timeScale

      // Draw time marker line with gradient
      if (isValidNumber(chartTop) && isValidNumber(processesHeight)) {
        const gradient = ctx.createLinearGradient(0, chartTop, 0, chartTop + processesHeight)
        gradient.addColorStop(0, "#e2e8f0") // slate-200
        gradient.addColorStop(1, "#f1f5f9") // slate-100
        ctx.strokeStyle = gradient
      } else {
        ctx.strokeStyle = "#e2e8f0" // Use solid color as fallback
      }
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, chartTop)
      ctx.lineTo(x, chartTop + processesHeight)
      ctx.stroke()

      // Draw time label with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.fillText(t.toString(), x, 20)
      ctx.shadowColor = "transparent"
    }

    // Draw current time indicator with animation effect
    const currentX = 100 + currentTime * timeScale
    ctx.strokeStyle = "#ef4444" // red-500
    ctx.lineWidth = 2

    // Add glow effect
    ctx.shadowColor = "rgba(239, 68, 68, 0.5)"
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.beginPath()
    ctx.moveTo(currentX, 0)
    ctx.lineTo(currentX, height)
    ctx.stroke()

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.lineWidth = 1

    // Draw process names with better styling
    ctx.fillStyle = "#334155" // slate-700
    ctx.textAlign = "right"
    ctx.font = "bold 13px Inter, system-ui, sans-serif"

    processes.forEach((process, index) => {
      const y = chartTop + index * (processHeight + processGap) + processHeight / 2
      ctx.fillText(process.name, 90, y + 5)
    })

    // Draw process timelines with better styling
    processes.forEach((process, index) => {
      const y = chartTop + index * (processHeight + processGap)

      // Draw arrival marker with better styling
      const arrivalX = 100 + process.arrivalTime * timeScale

      // Triangle marker with gradient
      if (isValidNumber(arrivalX) && isValidNumber(y)) {
        const markerGradient = ctx.createLinearGradient(arrivalX - 5, y, arrivalX + 5, y + 20)
        markerGradient.addColorStop(0, "#3b82f6") // blue-500
        markerGradient.addColorStop(1, "#2563eb") // blue-600
        ctx.fillStyle = markerGradient
      } else {
        ctx.fillStyle = "#3b82f6" // Use solid color as fallback
      }

      ctx.beginPath()
      ctx.moveTo(arrivalX, y)
      ctx.lineTo(arrivalX + 10, y + 10)
      ctx.lineTo(arrivalX, y + 20)
      ctx.closePath()
      ctx.fill()

      // Draw timeline background with rounded corners
      ctx.fillStyle = "#f1f5f9" // slate-100
      ctx.beginPath()
      ctx.roundRect(100, y, maxTime * timeScale, processHeight, 4)
      ctx.fill()

      // Add subtle border
      ctx.strokeStyle = "#e2e8f0" // slate-200
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw Gantt chart bars with better styling
    data.forEach((item) => {
      const process = processes.find((p) => p.id === item.id)
      if (!process) return

      const index = processes.findIndex((p) => p.id === item.id)
      const y = chartTop + index * (processHeight + processGap)

      const startX = 100 + item.start * timeScale
      const endX = 100 + item.end * timeScale
      const width = endX - startX

      // Draw process execution bar with rounded corners and gradient
      const baseColor = item.color
      const darkerColor = adjustColor(baseColor, -20) // Slightly darker for gradient

      if (isValidNumber(startX) && isValidNumber(y) && isValidNumber(processHeight)) {
        const barGradient = ctx.createLinearGradient(startX, y, startX, y + processHeight)
        barGradient.addColorStop(0, baseColor)
        barGradient.addColorStop(1, darkerColor)
        ctx.fillStyle = barGradient
      } else {
        ctx.fillStyle = baseColor // Use solid color as fallback
      }

      // Rounded rectangle for process bar
      ctx.beginPath()
      ctx.roundRect(startX, y, width, processHeight, 4)
      ctx.fill()

      // Add subtle highlight at the top
      ctx.beginPath()
      ctx.moveTo(startX + 4, y)
      ctx.lineTo(startX + width - 4, y)
      ctx.strokeStyle = adjustColor(baseColor, 30) // Lighter color for highlight
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw process ID on the bar if wide enough
      if (width > 30) {
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.font = "bold 13px Inter, system-ui, sans-serif"
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 3
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.fillText(process.name, startX + width / 2, y + processHeight / 2 + 5)
        ctx.shadowColor = "transparent"
      }
    })
  }, [data, processes, currentTime, maxTime, width, height])

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    const clamp = (val: number) => Math.min(255, Math.max(0, val))

    // Convert hex to RGB
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Adjust brightness
    const newR = clamp(r + amount)
    const newG = clamp(g + amount)
    const newB = clamp(b + amount)

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-auto" style={{ maxHeight: "400px" }} />
    </div>
  )
}
