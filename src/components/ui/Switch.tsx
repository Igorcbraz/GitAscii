import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Switch({ checked, onChange, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${checked ? 'bg-signal-lime' : 'bg-zinc-700'} focus:outline-none ${className}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(!checked)
      }}
    >
      <span
        className={`absolute left-0.5 w-4 h-4 rounded-full transition-transform ${checked ? 'bg-graphite translate-x-4' : 'bg-chalk translate-x-0'}`}
      />
    </button>
  )
}
