'use client'

import { ChevronDown } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export interface CustomSelectOption {
  value: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  options: CustomSelectOption[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-colors text-left cursor-pointer focus:outline-none focus:border-[#c5ff4a]/50 text-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected?.icon && <span className="text-[#888] shrink-0">{selected.icon}</span>}
          <div className="min-w-0">
            <span className="text-white/90 truncate block text-xs font-medium">
              {selected ? selected.label : placeholder || 'Select...'}
            </span>
            {selected?.sublabel && (
              <span className="text-[10px] text-[#7a7a7a] font-mono block truncate">
                {selected.sublabel}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#666] transition-transform duration-150 shrink-0 ${
            open ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] rounded-xl bg-[#141414] border border-white/15 shadow-2xl p-1 space-y-0.5 max-h-72 overflow-y-auto animate-fade-in">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#c5ff4a]/10 text-[#c5ff4a] font-medium'
                    : 'text-[#aaa] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon && <span className="shrink-0 text-inherit">{opt.icon}</span>}
                  <div className="min-w-0">
                    <span className="truncate block font-medium">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-[#777] font-mono block truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
