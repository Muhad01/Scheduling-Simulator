"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("relative", className)} ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

interface ChartProps extends React.HTMLAttributes<SVGSVGElement> {
  type: "line" | "bar"
  data: {
    name: string
    value: number
    color: string
  }[]
  categories: string[]
}

const Chart = React.forwardRef<SVGSVGElement, ChartProps>(({ className, type, data, categories, ...props }, ref) => {
  // Simple rendering of bars without using function children
  const renderBars = () => {
    const maxValue = Math.max(...data.map((item) => item.value), 0.1)
    const barWidth = 100 / data.length

    return data.map((item, index) => {
      const height = (item.value / maxValue) * 100
      const x = index * barWidth
      const y = 100 - height

      return (
        <rect
          key={index}
          x={`${x}%`}
          y={`${y}%`}
          width={`${barWidth * 0.8}%`}
          height={`${height}%`}
          fill={item.color}
          rx={4}
        />
      )
    })
  }

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      ref={ref}
      {...props}
    >
      {renderBars()}
    </svg>
  )
})
Chart.displayName = "Chart"

interface ChartBarProps extends React.HTMLAttributes<SVGRectElement> {
  item: any
  style?: React.CSSProperties
}

const ChartBar = React.forwardRef<SVGRectElement, ChartBarProps>(({ className, item, style, ...props }, ref) => {
  return (
    <rect
      className={cn(className)}
      ref={ref}
      {...props}
      x={item.x}
      y={item.y0}
      width={item.width}
      height={item.height}
      style={style}
    />
  )
})
ChartBar.displayName = "ChartBar"

const ChartGroup = React.forwardRef<SVGGElement, React.HTMLAttributes<SVGGElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <g className={cn(className)} ref={ref} {...props}>
        {children}
      </g>
    )
  },
)
ChartGroup.displayName = "ChartGroup"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "absolute z-10 rounded-md border bg-popover p-4 text-popover-foreground shadow-md animate-in fade-in",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("space-y-1", className)} ref={ref} {...props} />
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartTooltipItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  color: string
}

const ChartTooltipItem = React.forwardRef<HTMLDivElement, ChartTooltipItemProps>(
  ({ className, label, value, color, ...props }, ref) => {
    return (
      <div className={cn("flex items-center justify-between text-sm", className)} ref={ref} {...props}>
        <span className="flex items-center">
          <span className="mr-2 block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="font-medium">{value}</span>
      </div>
    )
  },
)
ChartTooltipItem.displayName = "ChartTooltipItem"

export { Chart, ChartContainer, ChartBar, ChartGroup, ChartTooltip, ChartTooltipContent, ChartTooltipItem }
