import { Scheduler } from "@/components/scheduler"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-3">
            Interactive Scheduling Simulator
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Visualize and compare CPU scheduling algorithms with real-time adaptive feedback
          </p>
        </div>
        <Scheduler />
      </div>
    </main>
  )
}
