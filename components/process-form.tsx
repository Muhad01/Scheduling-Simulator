"use client"

import type React from "react"
import { useState } from "react"
import { type Process, ProcessState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

interface ProcessFormProps {
  onAddProcess: (process: Process) => void
  currentTime: number
}

export function ProcessForm({ onAddProcess, currentTime }: ProcessFormProps) {
  const [name, setName] = useState("")
  const [arrivalTime, setArrivalTime] = useState(currentTime)
  const [burstTime, setBurstTime] = useState(5)
  const [priority, setPriority] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newProcess: Process = {
      id: 0, // Will be set by the parent component
      name: name || `Process ${Math.floor(Math.random() * 1000)}`,
      arrivalTime,
      burstTime,
      priority,
      remainingTime: burstTime,
      state: arrivalTime <= currentTime ? ProcessState.Ready : ProcessState.NotArrived,
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: -1,
      completionTime: -1,
      color: "", // Will be set by the parent component
    }

    onAddProcess(newProcess)

    // Reset form
    setName("")
    setArrivalTime(currentTime)
    setBurstTime(5)
    setPriority(1)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
            Process Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Process Name"
            className="border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrivalTime" className="text-slate-700 dark:text-slate-300">
            Arrival Time (s)
          </Label>
          <Input
            id="arrivalTime"
            type="number"
            min="0"
            step="0.1"
            value={isNaN(arrivalTime) ? 0 : arrivalTime}
            onChange={(e) => setArrivalTime(Number.parseFloat(e.target.value) || 0)}
            className="border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="burstTime" className="text-slate-700 dark:text-slate-300">
            Burst Time (s)
          </Label>
          <Input
            id="burstTime"
            type="number"
            min="1"
            step="1"
            value={isNaN(burstTime) ? 1 : burstTime}
            onChange={(e) => setBurstTime(Number.parseInt(e.target.value) || 1)}
            className="border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300">
            Priority (lower is higher)
          </Label>
          <Input
            id="priority"
            type="number"
            min="1"
            step="1"
            value={isNaN(priority) ? 1 : priority}
            onChange={(e) => setPriority(Number.parseInt(e.target.value) || 1)}
            className="border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      >
        Add Process
      </Button>
    </motion.form>
  )
}
