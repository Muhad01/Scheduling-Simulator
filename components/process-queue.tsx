"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Process, SchedulingAlgorithm } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Layers } from "lucide-react"

interface ProcessQueueProps {
  readyQueue: Process[]
  runningProcess: Process | null
  completedProcesses: Process[]
  processes: Process[]
  algorithm?: SchedulingAlgorithm
}

export function ProcessQueue({
  readyQueue,
  runningProcess,
  completedProcesses,
  processes,
  algorithm,
}: ProcessQueueProps) {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleProcessClick = (process: Process) => {
    setSelectedProcess(process)
    setIsDialogOpen(true)
  }

  const getQueueName = (level: number | undefined) => {
    if (level === undefined) return "Queue 1 (Highest Priority)"
    switch (level) {
      case 1:
        return "Queue 1 (Highest Priority, Time Quantum: 2s)"
      case 2:
        return "Queue 2 (Medium Priority, Time Quantum: 4s)"
      case 3:
        return "Queue 3 (Lowest Priority, FCFS)"
      default:
        return `Queue ${level}`
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-sm mb-3 text-slate-500 dark:text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Ready Queue
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {readyQueue.length === 0 ? (
              <span className="text-sm text-slate-400 dark:text-slate-500 italic">Empty</span>
            ) : (
              readyQueue.map((process, index) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center cursor-pointer hover:brightness-90 transition-all`}
                  style={{
                    backgroundColor: process.color,
                    color: "white",
                    boxShadow: `0 1px 2px ${process.color}40`,
                  }}
                  onClick={() => handleProcessClick(process)}
                >
                  {process.name}
                  <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px]">
                    {process.remainingTime}s
                  </span>
                  {algorithm === "MLFQ" && process.queueLevel && (
                    <span className="ml-1 bg-white/30 rounded-full px-1.5 py-0.5 text-[10px] flex items-center">
                      <Layers className="h-2 w-2 mr-0.5" />Q{process.queueLevel}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-sm mb-3 text-slate-500 dark:text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Currently Running
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
            {runningProcess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center justify-between w-full cursor-pointer hover:brightness-90 transition-all"
                style={{
                  backgroundColor: runningProcess.color,
                  color: "white",
                  boxShadow: `0 2px 4px ${runningProcess.color}40`,
                }}
                onClick={() => handleProcessClick(runningProcess)}
              >
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2"></span>
                  {runningProcess.name}
                  {algorithm === "MLFQ" && runningProcess.queueLevel && (
                    <span className="ml-2 bg-white/30 rounded-full px-2 py-0.5 text-xs flex items-center">
                      <Layers className="h-3 w-3 mr-1" />
                      Queue {runningProcess.queueLevel}
                    </span>
                  )}
                </span>
                <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                  {runningProcess.remainingTime}s remaining
                </span>
              </motion.div>
            ) : (
              <span className="text-sm text-slate-400 dark:text-slate-500 italic">CPU Idle</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-sm mb-3 text-slate-500 dark:text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            Completed
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {completedProcesses.length === 0 ? (
              <span className="text-sm text-slate-400 dark:text-slate-500 italic">None</span>
            ) : (
              completedProcesses.map((process, index) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center cursor-pointer hover:brightness-90 transition-all"
                  style={{
                    backgroundColor: process.color,
                    color: "white",
                    boxShadow: `0 1px 2px ${process.color}40`,
                  }}
                  onClick={() => handleProcessClick(process)}
                >
                  {process.name}
                  <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {algorithm === "MLFQ" && process.queueLevel !== undefined && (
                    <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px]">
                      Q{process.queueLevel}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Process Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: selectedProcess?.color }}></div>
              Process Details: {selectedProcess?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedProcess && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ID</p>
                    <p className="font-medium">{selectedProcess.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">State</p>
                    <p className="font-medium">
                      {selectedProcess.state === 0
                        ? "Not Arrived"
                        : selectedProcess.state === 1
                          ? "Ready"
                          : selectedProcess.state === 2
                            ? "Running"
                            : "Completed"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Arrival Time</p>
                    <p className="font-medium">{selectedProcess.arrivalTime}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Burst Time</p>
                    <p className="font-medium">{selectedProcess.burstTime}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Remaining Time</p>
                    <p className="font-medium">{selectedProcess.remainingTime}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority</p>
                    <p className="font-medium">{selectedProcess.priority}</p>
                  </div>

                  {algorithm === "MLFQ" && selectedProcess.queueLevel !== undefined && (
                    <div className="col-span-2 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                        <Layers className="h-4 w-4 mr-1 text-pink-500" />
                        MLFQ Queue Level
                      </p>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            backgroundColor:
                              selectedProcess.queueLevel === 1
                                ? "#ec4899"
                                : selectedProcess.queueLevel === 2
                                  ? "#8b5cf6"
                                  : "#3b82f6",
                          }}
                        >
                          {selectedProcess.queueLevel}
                        </div>
                        <p className="font-medium">{getQueueName(selectedProcess.queueLevel)}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {selectedProcess.queueLevel === 1
                          ? "Highest priority queue with a time quantum of 2s. If the process doesn't complete within this time, it will be moved to Queue 2."
                          : selectedProcess.queueLevel === 2
                            ? "Medium priority queue with a time quantum of 4s. If the process doesn't complete within this time, it will be moved to Queue 3."
                            : "Lowest priority queue using First-Come, First-Served scheduling. Processes will run to completion."}
                      </p>
                    </div>
                  )}
                </div>

                {selectedProcess.state === 3 && (
                  <div className="space-y-1 border-t pt-4 border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Time</p>
                    <p className="font-medium">{selectedProcess.completionTime}s</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Turnaround Time</p>
                    <p className="font-medium">{selectedProcess.turnaroundTime}s</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Waiting Time</p>
                    <p className="font-medium">{selectedProcess.waitingTime}s</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
