'use client'

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useI18n } from '@/i18n'

export interface CustomDatePickerProps {
  value: string // 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DD'
  onChange: (value: string) => void
  placeholder?: string
  includeTime?: boolean
  className?: string
  disabled?: boolean
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder,
  includeTime = true,
  className = '',
  disabled = false,
}) => {
  const { t, language } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsedDate = value ? new Date(value) : null
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime())

  const [viewDate, setViewDate] = useState(() => (isValidDate ? parsedDate : new Date()))

  const [hours, setHours] = useState(() =>
    isValidDate ? String(parsedDate.getHours()).padStart(2, '0') : '12'
  )
  const [minutes, setMinutes] = useState(() =>
    isValidDate ? String(parsedDate.getMinutes()).padStart(2, '0') : '00'
  )

  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setViewDate(d)
        setHours(String(d.getHours()).padStart(2, '0'))
        setMinutes(String(d.getMinutes()).padStart(2, '0'))
      }
    }
  }, [value])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = useMemo(() => {
    try {
      const d = new Date(year, month, 1)
      const formatted = new Intl.DateTimeFormat(language || 'en', { month: 'long' }).format(d)
      return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    } catch {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
        month
      ]
    }
  }, [year, month, language])

  const daysShort = useMemo(() => {
    try {
      const base = new Date(Date.UTC(2026, 0, 4, 12, 0, 0))
      return [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const d = new Date(base.getTime() + i * 86400000)
        return new Intl.DateTimeFormat(language || 'en', { weekday: 'narrow' }).format(d)
      })
    } catch {
      return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  }, [language])

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const handleSelectDay = (day: number) => {
    const selected = new Date(
      year,
      month,
      day,
      parseInt(hours, 10) || 0,
      parseInt(minutes, 10) || 0
    )
    const yyyy = selected.getFullYear()
    const mm = String(selected.getMonth() + 1).padStart(2, '0')
    const dd = String(selected.getDate()).padStart(2, '0')

    if (includeTime) {
      const hh = hours.padStart(2, '0')
      const min = minutes.padStart(2, '0')
      onChange(`${yyyy}-${mm}-${dd}T${hh}:${min}`)
    } else {
      onChange(`${yyyy}-${mm}-${dd}`)
      setIsOpen(false)
    }
  }

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours)
    setMinutes(newMinutes)
    if (isValidDate) {
      const yyyy = parsedDate.getFullYear()
      const mm = String(parsedDate.getMonth() + 1).padStart(2, '0')
      const dd = String(parsedDate.getDate()).padStart(2, '0')
      onChange(`${yyyy}-${mm}-${dd}T${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`)
    }
  }

  const formatDisplayValue = () => {
    if (!value || !isValidDate) return null
    const yyyy = parsedDate.getFullYear()
    const mm = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const dd = String(parsedDate.getDate()).padStart(2, '0')
    if (includeTime) {
      const hh = String(parsedDate.getHours()).padStart(2, '0')
      const min = String(parsedDate.getMinutes()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`
    }
    return `${yyyy}-${mm}-${dd}`
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-colors text-left cursor-pointer focus:outline-none focus:border-[#c5ff4a]/50 text-xs font-mono text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-3.5 h-3.5 text-[#888] shrink-0" />
          <span
            className={`truncate text-xs ${formatDisplayValue() ? 'text-white' : 'text-[#666]'}`}
          >
            {formatDisplayValue() ||
              placeholder ||
              t('pro.datepicker.placeholder', 'Select date & time...')}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[100] rounded-xl bg-[#141414] border border-white/10 shadow-2xl p-3 space-y-3 w-64 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">
              {monthName} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label={t('pro.datepicker.prev_month', 'Previous month')}
                className="p-1 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label={t('pro.datepicker.next_month', 'Next month')}
                className="p-1 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysShort.map((d, dIdx) => (
                <span key={`${d}-${dIdx}`} className="text-[10px] font-mono text-[#666]">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1
                return (
                  <div
                    key={`prev-${i}`}
                    className="h-6 flex items-center justify-center text-[10px] font-mono text-[#444] select-none"
                  >
                    {dayNum}
                  </div>
                )
              })}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const isSelected =
                  isValidDate &&
                  parsedDate.getFullYear() === year &&
                  parsedDate.getMonth() === month &&
                  parsedDate.getDate() === dayNum

                const isToday =
                  new Date().getFullYear() === year &&
                  new Date().getMonth() === month &&
                  new Date().getDate() === dayNum

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-6 flex items-center justify-center rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#c5ff4a] text-black font-bold'
                        : isToday
                          ? 'border border-[#c5ff4a]/50 text-[#c5ff4a] hover:bg-white/10'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </button>
                )
              })}
            </div>
          </div>

          {includeTime && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#888]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono uppercase">
                  {t('pro.datepicker.time', 'Time:')}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => {
                    const val = e.target.value.slice(-2)
                    handleTimeChange(val, minutes)
                  }}
                  className="w-8 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-center text-xs text-white focus:border-[#c5ff4a] focus:outline-none"
                />
                <span className="text-white/60">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    const val = e.target.value.slice(-2)
                    handleTimeChange(hours, val)
                  }}
                  className="w-8 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-center text-xs text-white focus:border-[#c5ff4a] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                const yyyy = now.getFullYear()
                const mm = String(now.getMonth() + 1).padStart(2, '0')
                const dd = String(now.getDate()).padStart(2, '0')
                const hh = String(now.getHours()).padStart(2, '0')
                const min = String(now.getMinutes()).padStart(2, '0')
                setHours(hh)
                setMinutes(min)
                setViewDate(now)
                onChange(includeTime ? `${yyyy}-${mm}-${dd}T${hh}:${min}` : `${yyyy}-${mm}-${dd}`)
                setIsOpen(false)
              }}
              className="text-[#c5ff4a] hover:underline cursor-pointer"
            >
              {t('pro.datepicker.now', 'Now')}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              {t('pro.datepicker.done', 'Done')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
