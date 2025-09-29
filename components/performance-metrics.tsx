"use client"

import type { Process } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Clock, BarChart2, Cpu, Zap } from "lucide-react"

interface PerformanceMetricsProps {
  metrics: {
    averageWaitingTime: number
    averageTurnaroundTime: number
    averageResponseTime: number
    cpuUtilization: number
    throughput: number
    shortProcesses: number
    longProcesses: number
    interactiveProcesses: number
  }
  processes: Process[]
}

export function PerformanceMetrics({ metrics, processes }: PerformanceMetricsProps) {
  const formatTime = (time: number) => {
    return time.toFixed(2) + "s"
  }

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%"
  }

  // Simple bar chart component that doesn't use function children
  const SimpleBarChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    const maxValue = Math.max(...data.map((item) => item.value), 0.1)

    return (
      <div className="h-64 w-full">
        <div className="flex h-full">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex-1 flex flex-col-reverse px-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 4px 6px -1px ${item.color}40`,
                    }}
                  />
                </div>
                <div className="text-xs mt-2 font-medium text-center truncate w-full px-1">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.value.toFixed(2)}s</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-violet-500 mr-2" />
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Waiting Time</div>
                </div>
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium px-2 py-1 rounded-full">
                  Time
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {formatTime(metrics.averageWaitingTime)}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Turnaround Time</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                  Time
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {formatTime(metrics.averageTurnaroundTime)}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Cpu className="h-5 w-5 text-emerald-500 mr-2" />
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">CPU Utilization</div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2 py-1 rounded-full">
                  Efficiency
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {formatPercentage(metrics.cpuUtilization)}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-amber-500 mr-2" />
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Throughput</div>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded-full">
                  Performance
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {metrics.throughput.toFixed(2)} proc/s
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
              <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                Process Waiting Times
              </h3>
              <div className="h-64">
                <SimpleBarChart
                  data={processes.map((p) => ({
                    name: p.name,
                    value: p.waitingTime,
                    color: p.color,
                  }))}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
              <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                <BarChart2 className="h-5 w-5 text-purple-500 mr-2" />
                Process Turnaround Times
              </h3>
              <div className="h-64">
                <SimpleBarChart
                  data={processes.map((p) => ({
                    name: p.name,
                    value: p.turnaroundTime,
                    color: p.color,
                  }))}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
            <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-slate-100 flex items-center">
              <Zap className="h-5 w-5 text-amber-500 mr-2" />
              Process Completion Order
            </h3>
            <div className="flex flex-wrap gap-3">
              {processes
                .filter((p) => p.completionTime > 0)
                .sort((a, b) => a.completionTime - b.completionTime)
                .map((process, index) => (
                  <motion.div
                    key={process.id}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: process.color }}></div>
                    <div className="font-medium">{process.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      (Completed at {process.completionTime.toFixed(1)}s)
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
