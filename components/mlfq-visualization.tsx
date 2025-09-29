"use client"

import { motion } from "framer-motion"
import type { MLFQDetails } from "@/lib/types"
import { Layers } from "lucide-react"

interface MLFQVisualizationProps {
  mlfqDetails: MLFQDetails
}

export function MLFQVisualization({ mlfqDetails }: MLFQVisualizationProps) {
  const getQueueColor = (level: number): string => {
    switch (level) {
      case 1:
        return "#ec4899" // pink-500
      case 2:
        return "#8b5cf6" // violet-500
      case 3:
        return "#3b82f6" // blue-500
      default:
        return "#64748b" // slate-500
    }
  }

  const getTimeQuantumText = (timeQuantum: number): string => {
    return timeQuantum === Number.POSITIVE_INFINITY ? "FCFS" : `${timeQuantum}s`
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Layers className="h-5 w-5 text-pink-500 mr-2" />
        Multilevel Feedback Queue Status
      </h3>

      <div className="space-y-4">
        {mlfqDetails.queues.map((queue) => (
          <div key={queue.level} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: getQueueColor(queue.level) }}
                >
                  {queue.level}
                </div>
                <span className="ml-2 font-medium">
                  {queue.level === 1
                    ? "Highest Priority Queue"
                    : queue.level === 2
                      ? "Medium Priority Queue"
                      : "Lowest Priority Queue"}
                </span>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                Time Quantum: {getTimeQuantumText(queue.timeQuantum)}
              </div>
            </div>

            <div
              className="h-12 rounded-lg flex items-center px-3"
              style={{ backgroundColor: `${getQueueColor(queue.level)}15` }}
            >
              {queue.processes.length > 0 ? (
                <div className="flex space-x-2 overflow-x-auto py-2 w-full">
                  {queue.processes.map((process) => (
                    <motion.div
                      key={process.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium shadow-sm flex items-center"
                      style={{
                        backgroundColor: process.color,
                        color: "white",
                      }}
                    >
                      {process.name}
                      <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px]">
                        {process.remainingTime}s
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400 italic">Empty</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
        <p className="font-medium mb-1">How MLFQ Works:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>New processes enter the highest priority queue (Queue 1)</li>
          <li>If a process uses its entire time quantum without completing, it moves to a lower priority queue</li>
          <li>The scheduler always picks processes from the highest priority non-empty queue</li>
          <li>Click on any process to see which queue it belongs to</li>
        </ul>
      </div>
    </div>
  )
}
