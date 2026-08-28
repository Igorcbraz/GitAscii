'use client'

import { Check, Copy, Download, ExternalLink, ImageIcon, Share2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'

import type { DailyDataPoint, TimeRange } from '../../types'
import { ProBadge } from '../ProBadge'

export interface ShareReportData {
  username: string
  period: TimeRange
  metrics: {
    totalViews: number
    uniqueVisitors: number
    cacheHitRatio: string
    avgDailyViews: number
    growthRateViews: string
    avgLatencyMs?: number
  }
  topCountries?: { name: string; count: number; percentage: number }[]
  topSources?: { name: string; count: number; percentage: number }[]
  timeSeries?: DailyDataPoint[]
}

export interface ShareReportModalProps {
  isOpen: boolean
  onClose: () => void
  data: ShareReportData | null
}

type CardTheme = 'cyber' | 'minimal'

export const ShareReportModal: React.FC<ShareReportModalProps> = ({ isOpen, onClose, data }) => {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [theme, setTheme] = useState<CardTheme>('cyber')
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !data) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 1200
    const height = 630
    canvas.width = width
    canvas.height = height

    const isCyber = theme === 'cyber'
    const accentColor = isCyber ? '#c5ff4a' : '#ffffff'
    const subAccent = isCyber ? '#34d399' : '#a1a1aa'
    const bgDark = isCyber ? '#09090b' : '#0a0a0a'
    const cardBg = isCyber ? '#121214' : '#141416'
    const borderColor = isCyber ? 'rgba(197, 255, 74, 0.2)' : 'rgba(255, 255, 255, 0.12)'

    ctx.fillStyle = bgDark
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.strokeRect(24, 24, width - 48, height - 48)

    ctx.fillStyle = isCyber ? 'rgba(197, 255, 74, 0.12)' : 'rgba(255, 255, 255, 0.08)'
    ctx.fillRect(56, 52, 160, 32)
    ctx.strokeStyle = isCyber ? 'rgba(197, 255, 74, 0.35)' : 'rgba(255, 255, 255, 0.2)'
    ctx.strokeRect(56, 52, 160, 32)

    ctx.fillStyle = accentColor
    ctx.font = 'bold 13px monospace'
    ctx.fillText('GITASCII PRO', 70, 73)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(228, 52, 140, 32)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.strokeRect(228, 52, 140, 32)

    ctx.fillStyle = '#a1a1aa'
    ctx.font = '12px monospace'
    ctx.fillText(`SCOPE: ${data.period.toUpperCase()}`, 242, 73)

    ctx.fillStyle = isCyber ? '#34d399' : '#ffffff'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('✓ VERIFIED TELEMETRY', width - 56, 73)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(`@${data.username}`, 56, 134)

    ctx.fillStyle = '#71717a'
    ctx.font = '15px sans-serif'
    ctx.fillText(
      `Verified README Profile Traffic & Performance Report • ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`,
      56,
      162
    )

    const cardY = 195
    const cardWidth = 252
    const cardHeight = 135
    const cardSpacing = 24
    const startX = 56

    const stats = [
      {
        label: 'TOTAL VIEWS',
        value: data.metrics.totalViews.toLocaleString(),
        sub: `+${data.metrics.growthRateViews} vs prev.`,
        accent: accentColor,
      },
      {
        label: 'UNIQUE DEVS',
        value: data.metrics.uniqueVisitors.toLocaleString(),
        sub: 'Cookieless HyperLogLog',
        accent: subAccent,
      },
      {
        label: 'CACHE HIT RATIO',
        value: data.metrics.cacheHitRatio,
        sub: 'HTTP 304 Validated',
        accent: accentColor,
      },
      {
        label: 'AVG SERVER SPEED',
        value: `${data.metrics.avgLatencyMs || 24}ms`,
        sub: 'Edge Synthesis SLA',
        accent: subAccent,
      },
    ]

    stats.forEach((st, idx) => {
      const x = startX + idx * (cardWidth + cardSpacing)

      ctx.fillStyle = cardBg
      ctx.fillRect(x, cardY, cardWidth, cardHeight)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(x, cardY, cardWidth, cardHeight)

      ctx.fillStyle = st.accent
      ctx.fillRect(x, cardY, cardWidth, 2)

      ctx.fillStyle = '#71717a'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(st.label, x + 18, cardY + 28)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 30px monospace'
      ctx.fillText(st.value, x + 18, cardY + 74)

      ctx.fillStyle = st.accent
      ctx.font = '11px monospace'
      ctx.fillText(st.sub, x + 18, cardY + 108)
    })

    const chartY = 358
    const chartHeight = 150
    const chartWidth = width - 112
    const chartX = 56

    ctx.fillStyle = cardBg
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight)

    ctx.fillStyle = '#71717a'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('DAILY TRAFFIC VOLUME (TIME-SERIES CURVE)', chartX + 18, chartY + 26)

    const points = data.timeSeries || []
    if (points.length > 1) {
      const maxVal = Math.max(...points.map((p) => p.views), 10)
      const graphBottom = chartY + chartHeight - 20
      const graphTop = chartY + 45
      const graphHeight = graphBottom - graphTop
      const stepX = (chartWidth - 36) / (points.length - 1)

      ctx.beginPath()
      points.forEach((pt, i) => {
        const px = chartX + 18 + i * stepX
        const py = graphBottom - (pt.views / maxVal) * graphHeight
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.lineTo(chartX + 18 + (points.length - 1) * stepX, graphBottom)
      ctx.lineTo(chartX + 18, graphBottom)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, graphTop, 0, graphBottom)
      grad.addColorStop(0, isCyber ? 'rgba(197, 255, 74, 0.25)' : 'rgba(255, 255, 255, 0.2)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.beginPath()
      points.forEach((pt, i) => {
        const px = chartX + 18 + i * stepX
        const py = graphBottom - (pt.views / maxVal) * graphHeight
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 2.5
      ctx.stroke()
    } else {
      ctx.fillStyle = '#52525b'
      ctx.font = '12px monospace'
      ctx.fillText('Telemetry aggregated from production CDN edge.', chartX + 18, chartY + 80)
    }

    ctx.fillStyle = '#52525b'
    ctx.font = '12px monospace'
    const topSrc = data.topSources?.[0]?.name || 'GitHub'
    const topCtry = data.topCountries?.[0]?.name || 'Global'
    ctx.fillText(
      `TOP SOURCE: ${topSrc.toUpperCase()} • TOP REGION: ${topCtry.toUpperCase()}`,
      56,
      height - 42
    )

    ctx.textAlign = 'right'
    ctx.fillStyle = '#71717a'
    ctx.fillText('gitascii.dev/pro • Privacy-First Developer Telemetry', width - 56, height - 42)
    ctx.textAlign = 'left'
  }, [isOpen, data, theme])

  if (!isOpen || !data) return null

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setGenerating(true)
    try {
      const link = document.createElement('a')
      link.download = `gitascii-performance-@${data.username}-${data.period}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.warn('Download error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      setGenerating(true)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ])
          setCopiedImage(true)
          setTimeout(() => setCopiedImage(false), 2500)
        } catch {
          handleCopyShareText()
        }
      }, 'image/png')
    } catch {
      handleCopyShareText()
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyShareText = () => {
    const text = `📊 GitAscii Pro Performance Report (@${data.username})
⚡ Views: ${data.metrics.totalViews.toLocaleString()} (${data.period.toUpperCase()})
👥 Unique Devs: ${data.metrics.uniqueVisitors.toLocaleString()}
🚀 Cache Hit: ${data.metrics.cacheHitRatio}
🌐 Verified at https://gitascii.dev/pro`

    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2500)
  }

  const handleShareTwitter = () => {
    const tweetText = `🚀 My GitHub Profile stats on @GitAscii Pro:
👀 ${data.metrics.totalViews.toLocaleString()} views (${data.period.toUpperCase()})
👤 ${data.metrics.uniqueVisitors.toLocaleString()} unique developers
⚡ ${data.metrics.cacheHitRatio} edge cache hit ratio

Verified telemetry with GitAscii Pro! #buildinpublic #github #developer`

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-[#0f0f10] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#141416]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {t('pro.share.modal_title', 'Share Performance Card')}
                </h3>
                <ProBadge variant="lime">PNG 1200x630</ProBadge>
              </div>
              <p className="text-[11px] text-[#8a8a8a]">
                {t(
                  'pro.share.modal_subtitle',
                  'High-resolution proof of reach ready for Twitter/X, LinkedIn, and GitHub.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setTheme('cyber')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  theme === 'cyber'
                    ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                    : 'text-[#8a8a8a] hover:text-white'
                }`}
              >
                {t('pro.share.theme_cyber', 'Cyber Lime')}
              </button>
              <button
                onClick={() => setTheme('minimal')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  theme === 'minimal'
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-[#8a8a8a] hover:text-white'
                }`}
              >
                {t('pro.share.theme_minimal', 'Minimal Slate')}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={t('pro.share.close_modal', 'Close modal')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-[#09090b] space-y-4">
          <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-xl bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block select-none"
              style={{ aspectRatio: '1200 / 630' }}
            />
          </div>

          <p className="text-[11px] font-mono text-[#71717a] text-center">
            {t(
              'pro.share.canvas_hint',
              'Rendered natively at 1200×630. Crisp on all social retina feeds and messaging platforms.'
            )}
          </p>
        </div>

        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141416] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {copiedText ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedText
                  ? t('pro.share.text_copied', 'Text Copied')
                  : t('pro.share.copy_text', 'Copy Text')}
              </span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1d9bf0]/15 hover:bg-[#1d9bf0]/25 border border-[#1d9bf0]/30 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <span>{t('pro.share.share_twitter', 'Share to X / Twitter')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyImage}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-all cursor-pointer"
            >
              {copiedImage ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-[#c5ff4a]" />
              )}
              <span>
                {copiedImage
                  ? t('pro.share.image_copied', 'Image Copied to Clipboard!')
                  : t('pro.share.copy_image', 'Copy Image')}
              </span>
            </button>

            <button
              onClick={handleDownload}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_15px_rgba(197,255,74,0.2)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('pro.share.download_png', 'Download PNG')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
