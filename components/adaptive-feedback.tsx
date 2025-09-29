"use client"

import type { SchedulingAlgorithm } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Lightbulb, X, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface AdaptiveFeedbackProps {
  suggestion: string
  onApply: (algorithm: SchedulingAlgorithm) => void
  onDismiss: () => void
  currentAlgorithm?: SchedulingAlgorithm
  metrics?: any
}

export function AdaptiveFeedback({ suggestion, onApply, onDismiss, currentAlgorithm, metrics }: AdaptiveFeedbackProps) {
  // Extract algorithm from suggestion
  const getAlgorithmFromSuggestion = (): SchedulingAlgorithm | null => {
    if (suggestion.includes("SJF")) return "SJF"
    if (suggestion.includes("Round Robin")) return "RoundRobin"
    if (suggestion.includes("Priority")) return "Priority"
    if (suggestion.includes("MLFQ")) return "MLFQ"
    if (suggestion.includes("FCFS")) return "FCFS"
    return null
  }

  const suggestedAlgorithm = getAlgorithmFromSuggestion()

  // Get the appropriate color based on the suggested algorithm
  const getAlgorithmColor = (algorithm: SchedulingAlgorithm | null): string => {
    switch (algorithm) {
      case "SJF":
        return "blue"
      case "RoundRobin":
        return "emerald"
      case "Priority":
        return "cyan"
      case "MLFQ":
        return "pink"
      case "FCFS":
        return "violet"
      default:
        return "amber"
    }
  }

  const color = getAlgorithmColor(suggestedAlgorithm)

  // Get algorithm description
  const getAlgorithmDescription = (algorithm: SchedulingAlgorithm | null): string => {
    switch (algorithm) {
      case "FCFS":
        return "First-Come, First-Served executes processes in arrival order. Simple but can lead to convoy effect."
      case "SJF":
        return "Shortest Job First minimizes average waiting time by prioritizing shorter processes."
      case "Priority":
        return "Priority scheduling executes higher priority processes first, improving system responsiveness."
      case "RoundRobin":
        return "Round Robin gives each process a time slice, ensuring fair execution and good responsiveness."
      case "MLFQ":
        return "Multilevel Feedback Queue adapts to different process types using multiple priority queues."
      default:
        return ""
    }
  }

  // Get algorithm strengths
  const getAlgorithmStrengths = (algorithm: SchedulingAlgorithm | null): string[] => {
    switch (algorithm) {
      case "FCFS":
        return ["Simple implementation", "No starvation", "Fair for processes with similar burst times"]
      case "SJF":
        return ["Optimal average waiting time", "Good for batch systems", "Efficient for mixed workloads"]
      case "Priority":
        return ["Prioritizes important processes", "Good for real-time systems", "Flexible priority assignment"]
      case "RoundRobin":
        return ["Fair CPU distribution", "Good for interactive systems", "Prevents process starvation"]
      case "MLFQ":
        return ["Adapts to different process types", "Balances throughput and response time", "Self-tuning"]
      default:
        return []
    }
  }

  // Get algorithm weaknesses
  const getAlgorithmWeaknesses = (algorithm: SchedulingAlgorithm | null): string[] => {
    switch (algorithm) {
      case "FCFS":
        return ["Convoy effect", "Poor for mixed workloads", "Long average waiting time"]
      case "SJF":
        return [
          "Potential starvation of long processes",
          "Requires burst time prediction",
          "Not ideal for interactive systems",
        ]
      case "Priority":
        return [
          "Potential starvation of low priority processes",
          "Priority inversion issues",
          "Requires priority assignment",
        ]
      case "RoundRobin":
        return ["Context switching overhead", "Time quantum selection is critical", "Not optimal for batch processing"]
      case "MLFQ":
        return ["Complex implementation", "Overhead of queue management", "Parameter tuning required"]
      default:
        return []
    }
  }

  // Compare algorithms based on metrics
  const getAlgorithmComparison = (): { [key: string]: number } => {
    if (!metrics) return {}

    // Base comparison on current metrics
    const waitingTimeScore = metrics.averageWaitingTime < 5 ? 90 : metrics.averageWaitingTime < 10 ? 70 : 50
    const cpuUtilizationScore = metrics.cpuUtilization * 100
    const throughputScore = metrics.throughput > 0.2 ? 80 : 60

    const comparison: { [key: string]: number } = {
      FCFS: 60, // Base score
      SJF: metrics.shortProcesses > metrics.longProcesses ? 85 : 70,
      Priority: metrics.cpuUtilization < 0.7 ? 80 : 65,
      RoundRobin: metrics.interactiveProcesses > 0 ? 85 : 70,
      MLFQ: metrics.shortProcesses > 0 && metrics.longProcesses > 0 ? 90 : 75,
    }

    // Adjust current algorithm score based on actual metrics
    if (currentAlgorithm) {
      comparison[currentAlgorithm] = (waitingTimeScore + cpuUtilizationScore + throughputScore) / 3
    }

    return comparison
  }

  const algorithmComparison = getAlgorithmComparison()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Alert
        className={`bg-gradient-to-r from-${color}-50 to-${color}-50/70 dark:from-${color}-900/20 dark:to-${color}-900/30 border border-${color}-200 dark:border-${color}-800`}
      >
        <Lightbulb className={`h-5 w-5 text-${color}-500`} />
        <AlertTitle className={`text-${color}-800 dark:text-${color}-300 font-medium`}>
          Algorithm Recommendation
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{suggestion}</p>

          {suggestedAlgorithm && currentAlgorithm && suggestedAlgorithm !== currentAlgorithm && (
            <div className="mb-4 bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${getAlgorithmColor(currentAlgorithm)}-500 mr-2`}></div>
                  <span className="font-medium">{currentAlgorithm}</span>
                </div>
                <ArrowRight className="h-4 w-4 mx-2 text-slate-400" />
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${color}-500 mr-2`}></div>
                  <span className="font-medium">{suggestedAlgorithm}</span>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Current: {currentAlgorithm}</span>
                    <span>{Math.round(algorithmComparison[currentAlgorithm] || 0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-500 dark:bg-slate-400"
                      style={{ width: `${algorithmComparison[currentAlgorithm] || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Suggested: {suggestedAlgorithm}</span>
                    <span>{Math.round(algorithmComparison[suggestedAlgorithm] || 0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full`}
                      style={{
                        width: `${algorithmComparison[suggestedAlgorithm] || 0}%`,
                        backgroundColor:
                          color === "blue"
                            ? "#3b82f6"
                            : color === "emerald"
                              ? "#10b981"
                              : color === "cyan"
                                ? "#06b6d4"
                                : color === "pink"
                                  ? "#ec4899"
                                  : color === "violet"
                                    ? "#8b5cf6"
                                    : "#f59e0b",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs">
                <p className="font-medium mb-1">Why {suggestedAlgorithm} might be better:</p>
                <p>{getAlgorithmDescription(suggestedAlgorithm)}</p>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="font-medium flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Strengths
                    </p>
                    <ul className="mt-1 space-y-1 pl-4 list-disc">
                      {getAlgorithmStrengths(suggestedAlgorithm)
                        .slice(0, 2)
                        .map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                      Current limitations
                    </p>
                    <ul className="mt-1 space-y-1 pl-4 list-disc">
                      {getAlgorithmWeaknesses(currentAlgorithm)
                        .slice(0, 2)
                        .map((weakness, i) => (
                          <li key={i}>{weakness}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {suggestedAlgorithm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApply(suggestedAlgorithm)}
                className={`bg-white dark:bg-slate-800 border-${color}-200 dark:border-${color}-800 hover:bg-${color}-50 dark:hover:bg-${color}-900/20 text-${color}-700 dark:text-${color}-300`}
              >
                Apply {suggestedAlgorithm}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </motion.div>
  )
}
