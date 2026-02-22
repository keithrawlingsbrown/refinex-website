import { cn } from '@/lib/utils'

interface SignalBadgeProps {
  type: 'spot_arbitrage' | 'interruption_risk'
  confidence?: number
  className?: string
}

export default function SignalBadge({ type, confidence, className }: SignalBadgeProps) {
  const config = {
    spot_arbitrage: {
      color: 'bg-semantic-success',
      text: 'Spot Arbitrage',
      icon: '↗',
    },
    interruption_risk: {
      color: 'bg-semantic-warning',
      text: 'Interruption Risk',
      icon: '⚠',
    },
  }

  const { color, text, icon } = config[type]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-refinex-navy',
        color,
        className
      )}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
      {confidence !== undefined && (
        <span className="opacity-75">({Math.round(confidence * 100)}%)</span>
      )}
    </div>
  )
}
