import type { Process } from "@/lib/types"

export function calculateMetrics(processes: Process[], completedProcesses: Process[]) {
  // Calculate average waiting time
  const totalWaitingTime = processes.reduce((sum, process) => sum + process.waitingTime, 0)
  const averageWaitingTime = totalWaitingTime / processes.length

  // Calculate average turnaround time
  const totalTurnaroundTime = processes.reduce((sum, process) => sum + process.turnaroundTime, 0)
  const averageTurnaroundTime = totalTurnaroundTime / processes.length

  // Calculate average response time
  const totalResponseTime = processes.reduce((sum, process) => {
    // Only include processes that have started
    if (process.responseTime >= 0) {
      return sum + process.responseTime
    }
    return sum
  }, 0)
  const averageResponseTime = totalResponseTime / (completedProcesses.length || 1)

  // Calculate CPU utilization
  const totalBurstTime = processes.reduce((sum, process) => sum + process.burstTime, 0)
  const lastCompletionTime =
    completedProcesses.length > 0 ? Math.max(...completedProcesses.map((p) => p.completionTime)) : 0.001 // Avoid division by zero
  const cpuUtilization = totalBurstTime / Math.max(lastCompletionTime, 0.001)

  // Calculate throughput
  const throughput = completedProcesses.length / Math.max(lastCompletionTime, 0.001)

  // Analyze process characteristics for adaptive feedback
  const shortProcesses = processes.filter((p) => p.burstTime <= 5).length
  const longProcesses = processes.filter((p) => p.burstTime > 5).length
  const interactiveProcesses = processes.filter((p) => p.burstTime <= 3 && p.arrivalTime > 0).length

  // Calculate context switches (approximation based on gantt chart segments)
  const contextSwitches = completedProcesses.length > 0 ? completedProcesses.length - 1 : 0

  // Calculate fairness (standard deviation of waiting times)
  const waitingTimes = processes.map((p) => p.waitingTime)
  const waitingTimeVariance = calculateVariance(waitingTimes)
  const fairnessScore = 1 / (1 + waitingTimeVariance) // Normalize to 0-1 range, higher is better

  return {
    averageWaitingTime,
    averageTurnaroundTime,
    averageResponseTime,
    cpuUtilization,
    throughput,
    shortProcesses,
    longProcesses,
    interactiveProcesses,
    contextSwitches,
    fairnessScore,
    waitingTimeVariance,
  }
}

// Helper function to calculate variance
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length

  return variance
}
