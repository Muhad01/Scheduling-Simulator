"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, FastForward } from "lucide-react"
import { motion } from "framer-motion"

interface SimulationControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  speed: number
  onSpeedChange: (speed: number) => void
}

export function SimulationControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  speed,
  onSpeedChange,
}: SimulationControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      {isRunning ? (
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={onPause}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Pause className="h-4 w-4 mr-1 text-amber-500" />
            Pause
          </Button>
        </motion.div>
      ) : (
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={onStart}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Play className="h-4 w-4 mr-1 text-green-500" />
            Start
          </Button>
        </motion.div>
      )}

      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4 mr-1 text-blue-500" />
          Reset
        </Button>
      </motion.div>

      <div className="flex items-center space-x-2 ml-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
        <FastForward className="h-4 w-4 text-purple-500" />
        <Slider
          id="speed"
          min={0.5}
          max={5}
          step={0.5}
          value={[isNaN(speed) ? 1 : speed]}
          onValueChange={(value) => onSpeedChange(value[0] || 1)}
          className="w-24 [&>span]:bg-purple-500"
        />
        <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
          {speed}x
        </span>
      </div>
    </div>
  )
}
