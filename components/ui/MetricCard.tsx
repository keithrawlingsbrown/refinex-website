'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Card from './Card'

interface MetricCardProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
  animate?: boolean
}

export default function MetricCard({
  value,
  label,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  animate = true,
}: MetricCardProps) {
  const [count, setCount] = useState(animate ? 0 : value)

  useEffect(() => {
    if (!animate) return

    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animate])

  const formattedValue = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <Card className={cn('text-center', className)} hover>
      <div className="text-4xl font-bold gradient-text mb-2">
        {prefix}{formattedValue}{suffix}
      </div>
      <div className="text-sm text-refinex-gray-100 opacity-80">{label}</div>
    </Card>
  )
}
