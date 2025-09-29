export enum ProcessState {
  NotArrived = 0,
  Ready = 1,
  Running = 2,
  Completed = 3,
}

export interface Process {
  id: number
  name: string
  arrivalTime: number
  burstTime: number
  priority: number
  remainingTime: number
  state: ProcessState
  waitingTime: number
  turnaroundTime: number
  responseTime: number
  completionTime: number
  color: string
  queueLevel?: number // Added for MLFQ tracking
}

export type SchedulingAlgorithm = "FCFS" | "SJF" | "Priority" | "RoundRobin" | "MLFQ"

export interface SchedulerState {
  readyQueue: Process[]
  runningProcess: Process | null
  completedProcesses: Process[]
  currentTime: number
  timeQuantumRemaining: number
}

// Added for MLFQ visualization
export interface MLFQDetails {
  queueCount: number
  queues: {
    level: number
    processes: Process[]
    timeQuantum: number
  }[]
}
