import React from 'react'

export interface ProBadgeProps {
  children?: React.ReactNode
  variant?: 'lime' | 'amber' | 'emerald' | 'rose' | 'muted' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export const ProBadge: React.FC<ProBadgeProps> = ({
  children = 'PRO',
  variant = 'lime',
  size = 'sm',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center gap-1 font-mono font-medium uppercase tracking-wider rounded-md transition-colors select-none'

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-none',
    md: 'text-xs px-2 py-0.5 leading-none',
  }

  const variantClasses = {
    lime: 'bg-[#c5ff4a]/15 text-[#c5ff4a] border border-[#c5ff4a]/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    muted: 'bg-white/5 text-[#8a8a8a] border border-white/10',
    outline: 'border border-white/20 text-white/80 bg-transparent',
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
