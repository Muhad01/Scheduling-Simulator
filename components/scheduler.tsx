"use client"

import { useState, useEffect, useRef } from "react"
import {
  type Process,
  type SchedulingAlgorithm,
  ProcessState,
  type SchedulerState,
  type MLFQDetails,
} from "@/lib/types"
import { ProcessForm } from "@/components/process-form"
import { GanttChart } from "@/components/gantt-chart"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { AlgorithmSelector } from "@/components/algorithm-selector"
import { ProcessQueue } from "@/components/process-queue"
import { ProcessTable } from "@/components/process-table"
import { AdaptiveFeedback } from "@/components/adaptive-feedback"
import { SimulationControls } from "@/components/simulation-controls"
import { MLFQVisualization } from "@/components/mlfq-visualization"
import { runFCFS, runSJF, runPriority, runRoundRobin, runMLFQ, getMLFQDetails } from "@/lib/algorithms"
import { calculateMetrics } from "@/lib/metrics"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Activity, Cpu, Lightbulb, BarChart2, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const createInitialSchedulerState = (): SchedulerState => ({
  readyQueue: [],
  runningProcess: null,
  completedProcesses: [],
  currentTime: 0,
  timeQuantumRemaining: 0,
})

export function Scheduler() {
  // Simulation state
  const [processes, setProcesses] = useState<Process[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1) // Simulation speed multiplier
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SchedulingAlgorithm>("FCFS")
  const [timeQuantum, setTimeQuantum] = useState(2) // For Round Robin
  const [preemptive, setPreemptive] = useState(false) // For SJF and Priority
  const [ganttData, setGanttData] = useState<{ id: number; start: number; end: number; color: string }[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [schedulerState, setSchedulerState] = useState<SchedulerState>(createInitialSchedulerState())
  const [algorithmHistory, setAlgorithmHistory] = useState<{ time: number; algorithm: SchedulingAlgorithm }[]>([])
  const [adaptiveSuggestion, setAdaptiveSuggestion] = useState<string | null>(null)
  const [adaptiveFeedbackVisible, setAdaptiveFeedbackVisible] = useState(true)
  const [mlfqDetails, setMlfqDetails] = useState<MLFQDetails | null>(null)

  const animationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const lastMetricsUpdateRef = useRef<number>(0)
  const processesRef = useRef<Process[]>([])
  const schedulerStateRef = useRef<SchedulerState>(createInitialSchedulerState())
  const currentTimeRef = useRef(0)
  const algorithmRef = useRef<SchedulingAlgorithm>(selectedAlgorithm)
  const timeQuantumRef = useRef(timeQuantum)
  const preemptiveRef = useRef(preemptive)

  const setProcessesWithRef = (updater: Process[] | ((prev: Process[]) => Process[])) => {
    if (typeof updater === "function") {
      setProcesses((prev) => {
        const next = (updater as (prev: Process[]) => Process[])(prev)
        processesRef.current = next
        return next
      })
    } else {
      processesRef.current = updater
      setProcesses(updater)
    }
  }

  useEffect(() => {
    processesRef.current = processes
  }, [processes])

  useEffect(() => {
    schedulerStateRef.current = schedulerState
  }, [schedulerState])

  useEffect(() => {
    currentTimeRef.current = currentTime
  }, [currentTime])

  useEffect(() => {
    algorithmRef.current = selectedAlgorithm
  }, [selectedAlgorithm])

  useEffect(() => {
    timeQuantumRef.current = timeQuantum
  }, [timeQuantum])

  useEffect(() => {
    preemptiveRef.current = preemptive
  }, [preemptive])

  // Add sample processes on initial load
  useEffect(() => {
    const sampleProcesses: Process[] = [
      {
        id: 1,
        name: "Process 1",
        arrivalTime: 0,
        burstTime: 6,
        priority: 3,
        remainingTime: 6,
        state: ProcessState.Ready,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        color: "#8b5cf6", // violet-500
      },
      {
        id: 2,
        name: "Process 2",
        arrivalTime: 2,
        burstTime: 4,
        priority: 1,
        remainingTime: 4,
        state: ProcessState.NotArrived,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        color: "#3b82f6", // blue-500
      },
      {
        id: 3,
        name: "Process 3",
        arrivalTime: 4,
        burstTime: 2,
        priority: 4,
        remainingTime: 2,
        state: ProcessState.NotArrived,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        color: "#06b6d4", // cyan-500
      },
      {
        id: 4,
        name: "Process 4",
        arrivalTime: 6,
        burstTime: 8,
        priority: 2,
        remainingTime: 8,
        state: ProcessState.NotArrived,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        color: "#10b981", // emerald-500
      },
    ]
    setProcessesWithRef(sampleProcesses)
  }, [])

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    lastUpdateTimeRef.current = performance.now()

    const runSimulation = (timestamp: number) => {
      const deltaTimeRaw = ((timestamp - lastUpdateTimeRef.current) / 1000) * speed
      const deltaTime = Math.max(deltaTimeRaw, 0)
      lastUpdateTimeRef.current = timestamp

      // Update simulation time
      const newTime = currentTimeRef.current + deltaTime
      currentTimeRef.current = newTime
      setCurrentTime(newTime)

      // Update process states based on current time
      updateProcessStates(newTime)

      // Run the selected scheduling algorithm
      const latestState: SchedulerState = { ...schedulerStateRef.current, currentTime: newTime }
      const newSchedulerState = runSchedulingAlgorithm(
        algorithmRef.current,
        latestState,
        processesRef.current,
        timeQuantumRef.current,
        preemptiveRef.current,
        deltaTime,
      )
      schedulerStateRef.current = newSchedulerState
      setSchedulerState(newSchedulerState)

      // Update Gantt chart
      updateGanttChart(newSchedulerState, deltaTime)

      // Update MLFQ details if using MLFQ algorithm
      if (algorithmRef.current === "MLFQ") {
        setMlfqDetails(getMLFQDetails(processesRef.current))
      }

      // Calculate metrics periodically during simulation (every 1 second of simulation time)
      if (newTime - lastMetricsUpdateRef.current >= 1) {
        const currentMetrics = calculateMetrics(processesRef.current, newSchedulerState.completedProcesses)
        setMetrics(currentMetrics)
        lastMetricsUpdateRef.current = newTime

        // Provide adaptive feedback during simulation
        if (newTime > 5) {
          // Only start giving feedback after 5 seconds
          provideAdaptiveFeedback(currentMetrics, newTime)
        }
      }

      // Check if simulation is complete
      if (
        newSchedulerState.completedProcesses.length === processesRef.current.length &&
        processesRef.current.length > 0
      ) {
        const finalMetrics = calculateMetrics(processesRef.current, newSchedulerState.completedProcesses)
        setMetrics(finalMetrics)
        setIsRunning(false)

        // Provide final adaptive feedback
        provideAdaptiveFeedback(finalMetrics, newTime, true)
      } else {
        animationRef.current = requestAnimationFrame(runSimulation)
      }
    }

    animationRef.current = requestAnimationFrame(runSimulation)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isRunning, speed])

  // Update process states based on current time
  const updateProcessStates = (time: number) => {
    setProcessesWithRef((prevProcesses) =>
      prevProcesses.map((process) => {
        if (process.state === ProcessState.NotArrived && time >= process.arrivalTime) {
          return { ...process, state: ProcessState.Ready }
        }
        return process
      }),
    )
  }

  // Run the selected scheduling algorithm
  const runSchedulingAlgorithm = (
    algorithm: SchedulingAlgorithm,
    state: SchedulerState,
    processes: Process[],
    timeQuantum: number,
    preemptive: boolean,
    deltaTime: number,
  ): SchedulerState => {
    switch (algorithm) {
      case "FCFS":
        return runFCFS(state, processes, deltaTime)
      case "SJF":
        return runSJF(state, processes, preemptive, deltaTime)
      case "Priority":
        return runPriority(state, processes, preemptive, deltaTime)
      case "RoundRobin":
        return runRoundRobin(state, processes, timeQuantum, deltaTime)
      case "MLFQ":
        return runMLFQ(state, processes, deltaTime)
      default:
        return state
    }
  }

  // Update Gantt chart data
  const updateGanttChart = (state: SchedulerState, deltaTime: number) => {
    if (!state.runningProcess) return

    const safeCurrentTime = Number.isFinite(state.currentTime) ? state.currentTime : 0
    const segmentStart = Number.isFinite(state.currentTime - deltaTime)
      ? Math.max(0, state.currentTime - deltaTime)
      : safeCurrentTime

    setGanttData((prev) => {
      const lastItem = prev[prev.length - 1]

      if (lastItem && lastItem.id === state.runningProcess!.id) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastItem,
            end: safeCurrentTime,
          },
        ]
      }

      return [
        ...prev,
        {
          id: state.runningProcess!.id,
          start: segmentStart,
          end: safeCurrentTime,
          color: state.runningProcess!.color,
        },
      ]
    })
  }

  // Provide adaptive feedback based on metrics
  const provideAdaptiveFeedback = (metrics: any, currentTime: number, isFinal = false) => {
    if (!metrics) return

    let suggestion = ""
    let shouldSuggest = false

    // Analyze metrics to provide algorithm suggestions
    if (metrics.averageWaitingTime > 8) {
      if (metrics.shortProcesses > metrics.longProcesses && selectedAlgorithm !== "SJF") {
        suggestion = `High waiting time detected with many short processes (${metrics.shortProcesses}). SJF would reduce waiting time by prioritizing shorter jobs.`
        shouldSuggest = true
      } else if (metrics.interactiveProcesses > 0 && selectedAlgorithm !== "RoundRobin") {
        suggestion = `High waiting time with ${metrics.interactiveProcesses} interactive processes. Round Robin would improve responsiveness by giving each process a time slice.`
        shouldSuggest = true
      }
    }

    if (metrics.cpuUtilization < 0.7 && selectedAlgorithm !== "Priority") {
      suggestion = `Low CPU utilization detected (${(metrics.cpuUtilization * 100).toFixed(1)}%). Priority scheduling would improve utilization by prioritizing important processes.`
      shouldSuggest = true
    }

    if (metrics.shortProcesses > 0 && metrics.longProcesses > 0 && selectedAlgorithm !== "MLFQ") {
      suggestion = `Mix of ${metrics.shortProcesses} short and ${metrics.longProcesses} long processes detected. MLFQ would optimize for both types by using multiple priority queues.`
      shouldSuggest = true
    }

    // For final feedback, provide a summary of the algorithm's performance
    if (isFinal) {
      const algorithmPerformance = getAlgorithmPerformanceMessage(selectedAlgorithm, metrics)
      if (algorithmPerformance) {
        suggestion = algorithmPerformance + (shouldSuggest ? " " + suggestion : "")
        shouldSuggest = true
      }
    }

    if (shouldSuggest) {
      setAdaptiveSuggestion(suggestion)
      setAdaptiveFeedbackVisible(true)
    }
  }

  // Get performance message for the current algorithm
  const getAlgorithmPerformanceMessage = (algorithm: SchedulingAlgorithm, metrics: any): string => {
    switch (algorithm) {
      case "FCFS":
        return metrics.averageWaitingTime > 10
          ? "FCFS performed poorly with high waiting times due to the convoy effect."
          : "FCFS performed adequately for this workload."
      case "SJF":
        return metrics.longProcesses > 0 && metrics.averageWaitingTime > 8
          ? "SJF caused starvation for longer processes."
          : "SJF performed well by prioritizing shorter jobs."
      case "Priority":
        return (
          "Priority scheduling completed with an average waiting time of " +
          metrics.averageWaitingTime.toFixed(2) +
          "s."
        )
      case "RoundRobin":
        return timeQuantum < 2
          ? "Round Robin with a small time quantum (" + timeQuantum + "s) caused high context switching overhead."
          : "Round Robin provided fair execution with a time quantum of " + timeQuantum + "s."
      case "MLFQ":
        return "MLFQ balanced responsiveness and throughput with multiple priority queues."
      default:
        return ""
    }
  }

  // Add a new process
  const addProcess = (process: Process) => {
    setProcessesWithRef((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1
      const newProcess = {
        ...process,
        id: nextId,
        state: process.arrivalTime <= currentTimeRef.current ? ProcessState.Ready : ProcessState.NotArrived,
        remainingTime: process.burstTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        color: getRandomColor(),
      }

      return [...prev, newProcess]
    })
  }

  // Update an existing process
  const updateProcess = (updatedProcess: Process) => {
    setProcessesWithRef((prev) =>
      prev.map((p) =>
        p.id === updatedProcess.id ? { ...updatedProcess, remainingTime: updatedProcess.burstTime } : p,
      ),
    )
  }

  // Remove a process
  const removeProcess = (id: number) => {
    setProcessesWithRef((prev) => prev.filter((p) => p.id !== id))
  }

  // Change the scheduling algorithm
  const changeAlgorithm = (algorithm: SchedulingAlgorithm) => {
    setSelectedAlgorithm(algorithm)
    setAlgorithmHistory((prev) => [...prev, { time: currentTimeRef.current, algorithm }])

    // Reset queue levels when switching to MLFQ
    if (algorithm === "MLFQ") {
      setProcessesWithRef((prev) =>
        prev.map((p) => ({
          ...p,
          queueLevel: p.state !== ProcessState.Completed ? 1 : p.queueLevel,
        })),
      )

      setMlfqDetails(getMLFQDetails(processesRef.current))
    } else {
      setMlfqDetails(null)
    }

    // Hide adaptive feedback when algorithm is changed
    setAdaptiveFeedbackVisible(false)
  }

  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentTime(0)
    currentTimeRef.current = 0
    setGanttData([])
    setMetrics(null)
    const initialState = createInitialSchedulerState()
    setSchedulerState(initialState)
    schedulerStateRef.current = initialState
    setAlgorithmHistory([])
    setAdaptiveSuggestion(null)
    setAdaptiveFeedbackVisible(false)
    setMlfqDetails(null)
    lastMetricsUpdateRef.current = 0
    lastUpdateTimeRef.current = performance.now()

    // Reset process states
    setProcessesWithRef((prev) =>
      prev.map((process) => ({
        ...process,
        state: process.arrivalTime <= 0 ? ProcessState.Ready : ProcessState.NotArrived,
        remainingTime: process.burstTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: -1,
        queueLevel: selectedAlgorithm === "MLFQ" ? 1 : undefined,
      })),
    )
  }

  // Helper function to get a random color
  const getRandomColor = () => {
    const colors = [
      "#8b5cf6", // violet-500
      "#3b82f6", // blue-500
      "#06b6d4", // cyan-500
      "#10b981", // emerald-500
      "#ec4899", // pink-500
      "#f97316", // orange-500
      "#0ea5e9", // sky-500
      "#84cc16", // lime-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Cpu className="h-6 w-6 text-purple-500 mr-2" />
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                    Simulation
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-full px-3 py-1 shadow-sm">
                    <Clock className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium">{currentTime.toFixed(1)}s</span>
                  </div>
                  <SimulationControls
                    isRunning={isRunning}
                    onStart={() => setIsRunning(true)}
                    onPause={() => setIsRunning(false)}
                    onReset={resetSimulation}
                    speed={speed}
                    onSpeedChange={setSpeed}
                  />
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <GanttChart data={ganttData} processes={processes} currentTime={currentTime} width={800} height={300} />
              </motion.div>

              {selectedAlgorithm === "MLFQ" && mlfqDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <MLFQVisualization mlfqDetails={mlfqDetails} />
                </motion.div>
              )}

              <AnimatePresence>
                {adaptiveSuggestion && adaptiveFeedbackVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <AdaptiveFeedback
                      suggestion={adaptiveSuggestion}
                      onApply={(algorithm) => changeAlgorithm(algorithm)}
                      onDismiss={() => setAdaptiveFeedbackVisible(false)}
                      currentAlgorithm={selectedAlgorithm}
                      metrics={metrics}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Activity className="h-5 w-5 text-blue-500 mr-2" />
                  Process Queue
                </h3>
                <ProcessQueue
                  readyQueue={schedulerState.readyQueue}
                  runningProcess={schedulerState.runningProcess}
                  completedProcesses={schedulerState.completedProcesses}
                  processes={processes}
                  algorithm={selectedAlgorithm}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Algorithm Settings
                </h2>
                {metrics && (
                  <div className="flex items-center bg-white/70 dark:bg-slate-800/70 rounded-full px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    CPU: {(metrics.cpuUtilization * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              <AlgorithmSelector
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={changeAlgorithm}
                timeQuantum={timeQuantum}
                onTimeQuantumChange={setTimeQuantum}
                preemptive={preemptive}
                onPreemptiveChange={setPreemptive}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                  Algorithm History
                </h3>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                  {algorithmHistory.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {algorithmHistory.map((entry, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex justify-between items-center p-2 rounded-md bg-white/50 dark:bg-slate-700/50"
                        >
                          <span className="text-slate-600 dark:text-slate-300">Time: {entry.time.toFixed(1)}s</span>
                          <span className="font-medium px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {entry.algorithm}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      No algorithm changes yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="processes" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-2">
          <TabsTrigger value="processes" className="text-sm">
            Processes
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-sm">
            Performance Metrics
          </TabsTrigger>
          <TabsTrigger value="learning" className="text-sm">
            Learning Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Process Management</h2>
                  <Button
                    onClick={() => document.getElementById("add-process-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Add Process
                  </Button>
                </div>

                <ProcessTable
                  processes={processes}
                  currentTime={currentTime}
                  onUpdateProcess={updateProcess}
                  onRemoveProcess={removeProcess}
                />

                <motion.div
                  id="add-process-form"
                  className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-medium mb-4 text-slate-800 dark:text-slate-100">Add New Process</h3>
                  <ProcessForm onAddProcess={addProcess} currentTime={currentTime} />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Performance Metrics</h2>
                {metrics ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PerformanceMetrics metrics={metrics} processes={processes} />
                  </motion.div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Cpu className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Run the simulation to see performance metrics</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsRunning(true)}>
                      Start Simulation
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Learning Mode</h2>
                <div className="space-y-6">
                  <motion.div
                    className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <h3 className="text-lg font-medium text-violet-700 dark:text-violet-300">
                      First-Come, First-Served (FCFS)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Processes are executed in the order they arrive. Simple but can lead to the "convoy effect" where
                      short processes wait behind long ones.
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">Shortest Job First (SJF)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Executes the process with the shortest burst time first. Optimal for minimizing average waiting
                      time but can cause starvation for longer processes.
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-cyan-700 dark:text-cyan-300">Priority Scheduling</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Executes processes based on priority. Higher priority processes are executed first. Can cause
                      starvation for lower priority processes.
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <h3 className="text-lg font-medium text-emerald-700 dark:text-emerald-300">Round Robin (RR)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Each process gets a small unit of CPU time (time quantum). After this time has elapsed, the
                      process is preempted and added to the end of the ready queue.
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <h3 className="text-lg font-medium text-pink-700 dark:text-pink-300">
                      Multilevel Feedback Queue (MLFQ)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Processes move between different priority queues based on their behavior. If a process uses too
                      much CPU time, it is moved to a lower priority queue.
                    </p>
                    <div className="mt-3 bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
                      <p className="text-xs font-medium flex items-center text-pink-700 dark:text-pink-300">
                        <Layers className="h-3 w-3 mr-1" />
                        Queue Levels
                      </p>
                      <ul className="mt-2 space-y-2 text-xs">
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-pink-500 mr-2 flex items-center justify-center text-[10px] text-white font-bold">
                            1
                          </div>
                          <span>Highest priority - Time Quantum: 2s</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-violet-500 mr-2 flex items-center justify-center text-[10px] text-white font-bold">
                            2
                          </div>
                          <span>Medium priority - Time Quantum: 4s</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-blue-500 mr-2 flex items-center justify-center text-[10px] text-white font-bold">
                            3
                          </div>
                          <span>Lowest priority - FCFS (no time quantum)</span>
                        </li>
                      </ul>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Click on any process to see which queue it belongs to.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-medium text-blue-700 dark:text-blue-300 mb-3">
                      Tips for Experimentation
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start">
                        <div className="bg-blue-500 rounded-full p-1 mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        Try running the same set of processes with different algorithms to compare performance
                      </li>
                      <li className="flex items-start">
                        <div className="bg-purple-500 rounded-full p-1 mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        Experiment with different time quantum values for Round Robin
                      </li>
                      <li className="flex items-start">
                        <div className="bg-cyan-500 rounded-full p-1 mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        Create a mix of short and long processes to see how different algorithms handle them
                      </li>
                      <li className="flex items-start">
                        <div className="bg-emerald-500 rounded-full p-1 mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        Use the preemptive option with SJF and Priority to see how it affects waiting times
                      </li>
                      <li className="flex items-start">
                        <div className="bg-pink-500 rounded-full p-1 mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        Watch how the adaptive feedback suggests algorithm changes based on workload
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
