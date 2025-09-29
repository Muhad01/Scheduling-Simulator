"use client"

import type { SchedulingAlgorithm } from "@/lib/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"

interface AlgorithmSelectorProps {
  selectedAlgorithm: SchedulingAlgorithm
  onAlgorithmChange: (algorithm: SchedulingAlgorithm) => void
  timeQuantum: number
  onTimeQuantumChange: (value: number) => void
  preemptive: boolean
  onPreemptiveChange: (value: boolean) => void
}

export function AlgorithmSelector({
  selectedAlgorithm,
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange,
  preemptive,
  onPreemptiveChange,
}: AlgorithmSelectorProps) {
  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedAlgorithm}
        onValueChange={(value) => onAlgorithmChange(value as SchedulingAlgorithm)}
        className="space-y-3"
      >
        <motion.div
          className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
            selectedAlgorithm === "FCFS"
              ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <RadioGroupItem value="FCFS" id="FCFS" className="text-violet-600" />
          <Label htmlFor="FCFS" className="font-medium cursor-pointer w-full">
            First-Come, First-Served (FCFS)
          </Label>
        </motion.div>

        <motion.div
          className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
            selectedAlgorithm === "SJF"
              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <RadioGroupItem value="SJF" id="SJF" className="text-blue-600" />
          <Label htmlFor="SJF" className="font-medium cursor-pointer w-full">
            Shortest Job First (SJF)
          </Label>
        </motion.div>

        <motion.div
          className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
            selectedAlgorithm === "Priority"
              ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <RadioGroupItem value="Priority" id="Priority" className="text-cyan-600" />
          <Label htmlFor="Priority" className="font-medium cursor-pointer w-full">
            Priority Scheduling
          </Label>
        </motion.div>

        <motion.div
          className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
            selectedAlgorithm === "RoundRobin"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <RadioGroupItem value="RoundRobin" id="RoundRobin" className="text-emerald-600" />
          <Label htmlFor="RoundRobin" className="font-medium cursor-pointer w-full">
            Round Robin (RR)
          </Label>
        </motion.div>

        <motion.div
          className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
            selectedAlgorithm === "MLFQ"
              ? "bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <RadioGroupItem value="MLFQ" id="MLFQ" className="text-pink-600" />
          <Label htmlFor="MLFQ" className="font-medium cursor-pointer w-full">
            Multilevel Feedback Queue (MLFQ)
          </Label>
        </motion.div>
      </RadioGroup>

      {(selectedAlgorithm === "SJF" || selectedAlgorithm === "Priority") && (
        <motion.div
          className="flex items-center space-x-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Switch
            id="preemptive"
            checked={preemptive}
            onCheckedChange={onPreemptiveChange}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="preemptive" className="font-medium">
            Preemptive
          </Label>
        </motion.div>
      )}

      {selectedAlgorithm === "RoundRobin" && (
        <motion.div
          className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <Label htmlFor="timeQuantum" className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-emerald-500" />
              Time Quantum
            </Label>
            <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              {timeQuantum}s
            </span>
          </div>
          <Slider
            id="timeQuantum"
            min={1}
            max={10}
            step={1}
            value={[isNaN(timeQuantum) ? 2 : timeQuantum]}
            onValueChange={(value) => onTimeQuantumChange(value[0] || 2)}
            className="[&>span]:bg-emerald-500"
          />
        </motion.div>
      )}
    </div>
  )
}
