"use client"

import { useState } from "react"
import { type Process, ProcessState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Save, X } from "lucide-react"
import { motion } from "framer-motion"

interface ProcessTableProps {
  processes: Process[]
  currentTime: number
  onUpdateProcess: (process: Process) => void
  onRemoveProcess: (id: number) => void
}

export function ProcessTable({ processes, currentTime, onUpdateProcess, onRemoveProcess }: ProcessTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Process>>({})

  const startEditing = (process: Process) => {
    setEditingId(process.id)
    setEditForm({
      name: process.name,
      arrivalTime: isNaN(process.arrivalTime) ? 0 : process.arrivalTime,
      burstTime: isNaN(process.burstTime) ? 1 : process.burstTime,
      priority: isNaN(process.priority) ? 1 : process.priority,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEditing = (process: Process) => {
    const updatedProcess = {
      ...process,
      name: editForm.name || process.name,
      arrivalTime: editForm.arrivalTime !== undefined ? editForm.arrivalTime : process.arrivalTime,
      burstTime: editForm.burstTime !== undefined ? editForm.burstTime : process.burstTime,
      priority: editForm.priority !== undefined ? editForm.priority : process.priority,
    }

    onUpdateProcess(updatedProcess)
    cancelEditing()
  }

  const getStateLabel = (state: ProcessState) => {
    switch (state) {
      case ProcessState.NotArrived:
        return "Not Arrived"
      case ProcessState.Ready:
        return "Ready"
      case ProcessState.Running:
        return "Running"
      case ProcessState.Completed:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const getStateColor = (state: ProcessState) => {
    switch (state) {
      case ProcessState.NotArrived:
        return "text-slate-500 bg-slate-100 dark:bg-slate-800"
      case ProcessState.Ready:
        return "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30"
      case ProcessState.Running:
        return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
      case ProcessState.Completed:
        return "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30"
      default:
        return ""
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800">
          <TableRow>
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Arrival Time</TableHead>
            <TableHead className="font-semibold">Burst Time</TableHead>
            <TableHead className="font-semibold">Remaining</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">State</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p>No processes added yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add a process using the form below</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            processes.map((process, index) => (
              <motion.tr
                key={process.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-medium">{process.id}</TableCell>
                <TableCell>
                  {editingId === process.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: process.color }}></span>
                      {process.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === process.id ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={isNaN(editForm.arrivalTime) ? 0 : editForm.arrivalTime}
                      onChange={(e) =>
                        setEditForm({ ...editForm, arrivalTime: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="w-full border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    process.arrivalTime
                  )}
                </TableCell>
                <TableCell>
                  {editingId === process.id ? (
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={isNaN(editForm.burstTime) ? 1 : editForm.burstTime}
                      onChange={(e) => setEditForm({ ...editForm, burstTime: Number.parseInt(e.target.value) || 1 })}
                      className="w-full border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    process.burstTime
                  )}
                </TableCell>
                <TableCell>{process.remainingTime}</TableCell>
                <TableCell>
                  {editingId === process.id ? (
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={isNaN(editForm.priority) ? 1 : editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: Number.parseInt(e.target.value) || 1 })}
                      className="w-full border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    process.priority
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(process.state)}`}>
                    {getStateLabel(process.state)}
                  </span>
                </TableCell>
                <TableCell>
                  {editingId === process.id ? (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => saveEditing(process)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(process)}
                        disabled={process.state === ProcessState.Running || process.state === ProcessState.Completed}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveProcess(process.id)}
                        disabled={process.state === ProcessState.Running || process.state === ProcessState.Completed}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
