import { type Process, ProcessState, type SchedulerState, type MLFQDetails } from "@/lib/types"

// First-Come, First-Served (FCFS) Algorithm
export function runFCFS(state: SchedulerState, processes: Process[]): SchedulerState {
  const newState = { ...state }

  // Update ready queue with newly arrived processes
  const readyProcesses = processes.filter(
    (p) =>
      p.state === ProcessState.Ready &&
      !newState.readyQueue.some((rp) => rp.id === p.id) &&
      !newState.completedProcesses.some((cp) => cp.id === p.id) &&
      (newState.runningProcess === null || p.id !== newState.runningProcess.id),
  )

  newState.readyQueue = [...newState.readyQueue, ...readyProcesses]

  // Sort ready queue by arrival time (FCFS)
  newState.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime)

  // If no process is running, get the next one from the ready queue
  if (newState.runningProcess === null && newState.readyQueue.length > 0) {
    newState.runningProcess = newState.readyQueue.shift()!

    // Update process state
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].state = ProcessState.Running

      // Record response time if not already set
      if (processes[processIndex].responseTime === -1) {
        processes[processIndex].responseTime = state.currentTime - processes[processIndex].arrivalTime
      }
    }
  }

  // If a process is running, update its remaining time
  if (newState.runningProcess) {
    const deltaTime = 0.1 // Small time step for simulation
    newState.runningProcess.remainingTime -= deltaTime

    // Update the process in the processes array
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].remainingTime = newState.runningProcess.remainingTime
    }

    // If process is completed
    if (newState.runningProcess.remainingTime <= 0) {
      // Set completion time and calculate turnaround time
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Completed
        processes[processIndex].completionTime = state.currentTime
        processes[processIndex].turnaroundTime =
          processes[processIndex].completionTime - processes[processIndex].arrivalTime
        processes[processIndex].waitingTime = processes[processIndex].turnaroundTime - processes[processIndex].burstTime
      }

      // Add to completed processes
      newState.completedProcesses.push(newState.runningProcess)
      newState.runningProcess = null
    }
  }

  // Update waiting time for processes in the ready queue
  newState.readyQueue.forEach((process) => {
    const processIndex = processes.findIndex((p) => p.id === process.id)
    if (processIndex !== -1) {
      processes[processIndex].waitingTime += 0.1 // Small time step
    }
  })

  return newState
}

// Shortest Job First (SJF) Algorithm
export function runSJF(state: SchedulerState, processes: Process[], preemptive: boolean): SchedulerState {
  const newState = { ...state }

  // Update ready queue with newly arrived processes
  const readyProcesses = processes.filter(
    (p) =>
      p.state === ProcessState.Ready &&
      !newState.readyQueue.some((rp) => rp.id === p.id) &&
      !newState.completedProcesses.some((cp) => cp.id === p.id) &&
      (newState.runningProcess === null || p.id !== newState.runningProcess.id),
  )

  newState.readyQueue = [...newState.readyQueue, ...readyProcesses]

  // Sort ready queue by remaining burst time (SJF)
  newState.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime)

  // If preemptive and a process with shorter burst time arrives
  if (preemptive && newState.runningProcess && newState.readyQueue.length > 0) {
    if (newState.readyQueue[0].remainingTime < newState.runningProcess.remainingTime) {
      // Preempt the current process
      newState.readyQueue.push(newState.runningProcess)

      // Update process state
      const processIndex = processes.findIndex((p) => p.id === newState.runningProcess.id)
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Ready
      }

      // Get the new process with shortest remaining time
      newState.runningProcess = newState.readyQueue.shift()!

      // Update new running process state
      const newProcessIndex = processes.findIndex((p) => p.id === newState.runningProcess.id)
      if (newProcessIndex !== -1) {
        processes[newProcessIndex].state = ProcessState.Running

        // Record response time if not already set
        if (processes[newProcessIndex].responseTime === -1) {
          processes[newProcessIndex].responseTime = state.currentTime - processes[newProcessIndex].arrivalTime
        }
      }

      // Re-sort the ready queue
      newState.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime)
    }
  }

  // If no process is running, get the next one from the ready queue
  if (newState.runningProcess === null && newState.readyQueue.length > 0) {
    newState.runningProcess = newState.readyQueue.shift()!

    // Update process state
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].state = ProcessState.Running

      // Record response time if not already set
      if (processes[processIndex].responseTime === -1) {
        processes[processIndex].responseTime = state.currentTime - processes[processIndex].arrivalTime
      }
    }
  }

  // If a process is running, update its remaining time
  if (newState.runningProcess) {
    const deltaTime = 0.1 // Small time step for simulation
    newState.runningProcess.remainingTime -= deltaTime

    // Update the process in the processes array
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].remainingTime = newState.runningProcess.remainingTime
    }

    // If process is completed
    if (newState.runningProcess.remainingTime <= 0) {
      // Set completion time and calculate turnaround time
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Completed
        processes[processIndex].completionTime = state.currentTime
        processes[processIndex].turnaroundTime =
          processes[processIndex].completionTime - processes[processIndex].arrivalTime
        processes[processIndex].waitingTime = processes[processIndex].turnaroundTime - processes[processIndex].burstTime
      }

      // Add to completed processes
      newState.completedProcesses.push(newState.runningProcess)
      newState.runningProcess = null
    }
  }

  // Update waiting time for processes in the ready queue
  newState.readyQueue.forEach((process) => {
    const processIndex = processes.findIndex((p) => p.id === process.id)
    if (processIndex !== -1) {
      processes[processIndex].waitingTime += 0.1 // Small time step
    }
  })

  return newState
}

// Priority Scheduling Algorithm
export function runPriority(state: SchedulerState, processes: Process[], preemptive: boolean): SchedulerState {
  const newState = { ...state }

  // Update ready queue with newly arrived processes
  const readyProcesses = processes.filter(
    (p) =>
      p.state === ProcessState.Ready &&
      !newState.readyQueue.some((rp) => rp.id === p.id) &&
      !newState.completedProcesses.some((cp) => cp.id === p.id) &&
      (newState.runningProcess === null || p.id !== newState.runningProcess.id),
  )

  newState.readyQueue = [...newState.readyQueue, ...readyProcesses]

  // Sort ready queue by priority (lower number = higher priority)
  newState.readyQueue.sort((a, b) => a.priority - b.priority)

  // If preemptive and a process with higher priority arrives
  if (preemptive && newState.runningProcess && newState.readyQueue.length > 0) {
    if (newState.readyQueue[0].priority < newState.runningProcess.priority) {
      // Preempt the current process
      newState.readyQueue.push(newState.runningProcess)

      // Update process state
      const processIndex = processes.findIndex((p) => p.id === newState.runningProcess.id)
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Ready
      }

      // Get the new process with highest priority
      newState.runningProcess = newState.readyQueue.shift()!

      // Update new running process state
      const newProcessIndex = processes.findIndex((p) => p.id === newState.runningProcess.id)
      if (newProcessIndex !== -1) {
        processes[newProcessIndex].state = ProcessState.Running

        // Record response time if not already set
        if (processes[newProcessIndex].responseTime === -1) {
          processes[newProcessIndex].responseTime = state.currentTime - processes[newProcessIndex].arrivalTime
        }
      }

      // Re-sort the ready queue
      newState.readyQueue.sort((a, b) => a.priority - b.priority)
    }
  }

  // If no process is running, get the next one from the ready queue
  if (newState.runningProcess === null && newState.readyQueue.length > 0) {
    newState.runningProcess = newState.readyQueue.shift()!

    // Update process state
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].state = ProcessState.Running

      // Record response time if not already set
      if (processes[processIndex].responseTime === -1) {
        processes[processIndex].responseTime = state.currentTime - processes[processIndex].arrivalTime
      }
    }
  }

  // If a process is running, update its remaining time
  if (newState.runningProcess) {
    const deltaTime = 0.1 // Small time step for simulation
    newState.runningProcess.remainingTime -= deltaTime

    // Update the process in the processes array
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].remainingTime = newState.runningProcess.remainingTime
    }

    // If process is completed
    if (newState.runningProcess.remainingTime <= 0) {
      // Set completion time and calculate turnaround time
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Completed
        processes[processIndex].completionTime = state.currentTime
        processes[processIndex].turnaroundTime =
          processes[processIndex].completionTime - processes[processIndex].arrivalTime
        processes[processIndex].waitingTime = processes[processIndex].turnaroundTime - processes[processIndex].burstTime
      }

      // Add to completed processes
      newState.completedProcesses.push(newState.runningProcess)
      newState.runningProcess = null
    }
  }

  // Update waiting time for processes in the ready queue
  newState.readyQueue.forEach((process) => {
    const processIndex = processes.findIndex((p) => p.id === process.id)
    if (processIndex !== -1) {
      processes[processIndex].waitingTime += 0.1 // Small time step
    }
  })

  return newState
}

// Round Robin Algorithm
export function runRoundRobin(state: SchedulerState, processes: Process[], timeQuantum: number): SchedulerState {
  const newState = { ...state }

  // Update ready queue with newly arrived processes
  const readyProcesses = processes.filter(
    (p) =>
      p.state === ProcessState.Ready &&
      !newState.readyQueue.some((rp) => rp.id === p.id) &&
      !newState.completedProcesses.some((cp) => cp.id === p.id) &&
      (newState.runningProcess === null || p.id !== newState.runningProcess.id),
  )

  newState.readyQueue = [...newState.readyQueue, ...readyProcesses]

  // If no process is running, get the next one from the ready queue
  if (newState.runningProcess === null && newState.readyQueue.length > 0) {
    newState.runningProcess = newState.readyQueue.shift()!
    newState.timeQuantumRemaining = timeQuantum

    // Update process state
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].state = ProcessState.Running

      // Record response time if not already set
      if (processes[processIndex].responseTime === -1) {
        processes[processIndex].responseTime = state.currentTime - processes[processIndex].arrivalTime
      }
    }
  }

  // If a process is running, update its remaining time and time quantum
  if (newState.runningProcess) {
    const deltaTime = 0.1 // Small time step for simulation
    newState.runningProcess.remainingTime -= deltaTime
    newState.timeQuantumRemaining -= deltaTime

    // Update the process in the processes array
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].remainingTime = newState.runningProcess.remainingTime
    }

    // If process is completed
    if (newState.runningProcess.remainingTime <= 0) {
      // Set completion time and calculate turnaround time
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Completed
        processes[processIndex].completionTime = state.currentTime
        processes[processIndex].turnaroundTime =
          processes[processIndex].completionTime - processes[processIndex].arrivalTime
        processes[processIndex].waitingTime = processes[processIndex].turnaroundTime - processes[processIndex].burstTime
      }

      // Add to completed processes
      newState.completedProcesses.push(newState.runningProcess)
      newState.runningProcess = null
      newState.timeQuantumRemaining = 0
    }
    // If time quantum is expired but process is not completed
    else if (newState.timeQuantumRemaining <= 0) {
      // Move process back to ready queue
      newState.readyQueue.push(newState.runningProcess)

      // Update process state
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Ready
      }

      newState.runningProcess = null
      newState.timeQuantumRemaining = 0
    }
  }

  // Update waiting time for processes in the ready queue
  newState.readyQueue.forEach((process) => {
    const processIndex = processes.findIndex((p) => p.id === process.id)
    if (processIndex !== -1) {
      processes[processIndex].waitingTime += 0.1 // Small time step
    }
  })

  return newState
}

// Multilevel Feedback Queue (MLFQ) Algorithm
export function runMLFQ(state: SchedulerState, processes: Process[]): SchedulerState {
  // For simplicity, we'll implement a 3-level MLFQ
  // Queue 1: RR with time quantum = 2
  // Queue 2: RR with time quantum = 4
  // Queue 3: FCFS

  const newState = { ...state }

  // Update ready queue with newly arrived processes
  // New processes always go to the highest priority queue (Queue 1)
  const readyProcesses = processes.filter(
    (p) =>
      p.state === ProcessState.Ready &&
      !newState.readyQueue.some((rp) => rp.id === p.id) &&
      !newState.completedProcesses.some((cp) => cp.id === p.id) &&
      (newState.runningProcess === null || p.id !== newState.runningProcess.id),
  )

  // Add queue level property to processes if not exists
  readyProcesses.forEach((p) => {
    if (p.queueLevel === undefined) {
      p.queueLevel = 1 // Start at highest priority

      // Update in the original processes array
      const processIndex = processes.findIndex((proc) => proc.id === p.id)
      if (processIndex !== -1) {
        processes[processIndex].queueLevel = 1
      }
    }
  })

  newState.readyQueue = [...newState.readyQueue, ...readyProcesses]

  // Sort ready queue by queue level first, then by arrival time
  newState.readyQueue.sort((a, b) => {
    const aLevel = a.queueLevel || 1
    const bLevel = b.queueLevel || 1
    if (aLevel !== bLevel) return aLevel - bLevel
    return a.arrivalTime - b.arrivalTime
  })

  // If no process is running, get the next one from the ready queue
  if (newState.runningProcess === null && newState.readyQueue.length > 0) {
    newState.runningProcess = newState.readyQueue.shift()!

    // Set time quantum based on queue level
    const queueLevel = newState.runningProcess.queueLevel || 1
    if (queueLevel === 1) {
      newState.timeQuantumRemaining = 2
    } else if (queueLevel === 2) {
      newState.timeQuantumRemaining = 4
    } else {
      // For FCFS (Queue 3), set a large time quantum
      newState.timeQuantumRemaining = 1000
    }

    // Update process state
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].state = ProcessState.Running

      // Record response time if not already set
      if (processes[processIndex].responseTime === -1) {
        processes[processIndex].responseTime = state.currentTime - processes[processIndex].arrivalTime
      }
    }
  }

  // If a process is running, update its remaining time and time quantum
  if (newState.runningProcess) {
    const deltaTime = 0.1 // Small time step for simulation
    newState.runningProcess.remainingTime -= deltaTime
    newState.timeQuantumRemaining -= deltaTime

    // Update the process in the processes array
    const processIndex = processes.findIndex((p) => p.id === newState.runningProcess!.id)
    if (processIndex !== -1) {
      processes[processIndex].remainingTime = newState.runningProcess.remainingTime
    }

    // If process is completed
    if (newState.runningProcess.remainingTime <= 0) {
      // Set completion time and calculate turnaround time
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Completed
        processes[processIndex].completionTime = state.currentTime
        processes[processIndex].turnaroundTime =
          processes[processIndex].completionTime - processes[processIndex].arrivalTime
        processes[processIndex].waitingTime = processes[processIndex].turnaroundTime - processes[processIndex].burstTime
      }

      // Add to completed processes
      newState.completedProcesses.push(newState.runningProcess)
      newState.runningProcess = null
      newState.timeQuantumRemaining = 0
    }
    // If time quantum is expired but process is not completed
    else if (newState.timeQuantumRemaining <= 0) {
      // Demote process to lower priority queue
      const currentLevel = newState.runningProcess.queueLevel || 1
      if (currentLevel < 3) {
        newState.runningProcess.queueLevel = currentLevel + 1

        // Update in processes array
        if (processIndex !== -1) {
          processes[processIndex].queueLevel = currentLevel + 1
        }
      }

      // Move process back to ready queue
      newState.readyQueue.push(newState.runningProcess)

      // Update process state
      if (processIndex !== -1) {
        processes[processIndex].state = ProcessState.Ready
      }

      newState.runningProcess = null
      newState.timeQuantumRemaining = 0

      // Re-sort the ready queue
      newState.readyQueue.sort((a, b) => {
        const aLevel = a.queueLevel || 1
        const bLevel = b.queueLevel || 1
        if (aLevel !== bLevel) return aLevel - bLevel
        return a.arrivalTime - b.arrivalTime
      })
    }
  }

  // Update waiting time for processes in the ready queue
  newState.readyQueue.forEach((process) => {
    const processIndex = processes.findIndex((p) => p.id === process.id)
    if (processIndex !== -1) {
      processes[processIndex].waitingTime += 0.1 // Small time step
    }
  })

  return newState
}

// Get MLFQ details for visualization
export function getMLFQDetails(processes: Process[]): MLFQDetails {
  // Create a structure to hold queue information
  const mlfqDetails: MLFQDetails = {
    queueCount: 3,
    queues: [
      { level: 1, processes: [], timeQuantum: 2 },
      { level: 2, processes: [], timeQuantum: 4 },
      { level: 3, processes: [], timeQuantum: Number.POSITIVE_INFINITY }, // FCFS queue
    ],
  }

  // Distribute processes to their respective queues
  processes.forEach((process) => {
    if (process.state === ProcessState.Ready) {
      const queueLevel = process.queueLevel || 1
      const queueIndex = Math.min(queueLevel - 1, 2) // Ensure it's within bounds
      mlfqDetails.queues[queueIndex].processes.push({ ...process })
    }
  })

  return mlfqDetails
}
