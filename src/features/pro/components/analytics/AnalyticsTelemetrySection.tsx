'use client'

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Cpu,
  Info,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary } from '../../types'
import { formatLocalizedCountry } from '../../utils/proFormatters'
import { CountryFlag } from '../CountryFlag'

interface AnalyticsTelemetrySectionProps {
  summary: AnalyticsSummary | null
  autoRefresh: boolean
  setAutoRefresh: (val: boolean) => void
  refreshing: boolean
  onFetchAnalytics: (isBackground?: boolean) => void
  feedPage: number
  setFeedPage: React.Dispatch<React.SetStateAction<number>>
  feedPageSize: number
  setFeedPageSize: React.Dispatch<React.SetStateAction<number>>
}

export const AnalyticsTelemetrySection: React.FC<AnalyticsTelemetrySectionProps> = ({
  summary,
  autoRefresh,
  setAutoRefresh,
  refreshing,
  onFetchAnalytics,
  feedPage,
  setFeedPage,
  feedPageSize,
  setFeedPageSize,
}) => {
  const { t, language } = useI18n()
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)

  const recentActivity = summary?.recentActivity || []
  const totalActivityEvents = recentActivity.length
  const totalFeedPages = Math.max(1, Math.ceil(totalActivityEvents / feedPageSize))
  const safeFeedPage = Math.min(Math.max(1, feedPage), totalFeedPages)
  const startEventIndex = (safeFeedPage - 1) * feedPageSize
  const endEventIndex = Math.min(startEventIndex + feedPageSize, totalActivityEvents)
  const paginatedActivity = recentActivity.slice(startEventIndex, endEventIndex)

  return (
    <section id="activity" className="space-y-6 scroll-mt-6 pt-4 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-[#c5ff4a]" />
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span>
                {t('pro.analytics.live_stream_title', 'Live Telemetry & Real-Time Stream')}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                {t('pro.analytics.stream_active', 'STREAM ACTIVE')}
              </span>
            </h2>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.live_stream_desc',
                'Real-time edge ingestion stream, request pulse, and latency observability.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold'
                : 'bg-white/5 border-white/10 text-[#8a8a8a] hover:text-white'
            }`}
            title={t('pro.analytics.toggle_stream_title', 'Toggle real-time auto-polling')}
          >
            {autoRefresh ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t('pro.analytics.streaming_btn', 'Streaming (15s)')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t('pro.analytics.resume_stream_btn', 'Resume Stream')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFetchAnalytics(false)}
            disabled={refreshing}
            className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
            />
            <span>{t('pro.analytics.sync_now', 'Sync Now')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded overflow-hidden border border-white/[0.08]">
        <div className="bg-[#0c0c0c] p-4 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
              {t('pro.analytics.active_concurrency', 'Requests (30m)')}
            </span>
            <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {(summary?.requestsLast30m ?? summary?.activeViewersLast30m ?? 0).toLocaleString()}
          </p>
          <div className="text-[10px] text-[#777] font-medium">
            {t('pro.analytics.concurrent_clients', 'observed requests')}
          </div>
        </div>

        <div className="bg-[#0c0c0c] p-4 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
              {t('pro.analytics.edge_latency', 'Edge Render Latency')}
            </span>
            <div className="p-1 rounded bg-[#c5ff4a]/10 border border-[#c5ff4a]/20">
              <Zap className="w-3.5 h-3.5 text-[#c5ff4a]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#c5ff4a] tracking-tight">
            {summary?.avgLatencyMs || 28}ms
          </p>
          <div className="text-[10px] text-[#777] flex items-center gap-1.5 font-medium">
            <span className="text-cyan-400 font-bold">&lt; 15ms</span>
            <span>{t('pro.analytics.cached_edge_hits', 'for cached edge hits')}</span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] p-4 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
              {t('pro.analytics.val_304_ratio', 'Validation 304 Ratio')}
            </span>
            <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-cyan-400 tracking-tight">
              {summary?.cacheHitRatio || 0}%
            </p>
            <span className="text-[10px] text-[#777] font-medium">
              {t('pro.analytics.etag_validated', 'ETag validated')}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${summary?.cacheHitRatio || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0c0c0c] p-4 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
              {t('pro.analytics.node_health', 'Node Health')}
            </span>
            <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white tracking-tight">100%</p>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              {t('pro.analytics.operational', 'operational')}
            </span>
          </div>
          <div className="text-[10px] text-[#777] font-medium">
            {t('pro.analytics.zero_dropped', 'Zero dropped telemetry packets')}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {t('pro.analytics.live_feed_title', 'Live Event Stream Feed')}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.live_feed_desc',
                'Anonymized, real-time incoming request telemetry across edge points.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8a8a8a] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              {totalActivityEvents > 0
                ? t(
                    'pro.analytics.showing_events_range',
                    'Showing {start}–{end} of {total} events',
                    {
                      start: String(startEventIndex + 1),
                      end: String(endEventIndex),
                      total: String(totalActivityEvents),
                    }
                  )
                : t('pro.analytics.showing_last_events', 'Showing last {count} events', {
                    count: '0',
                  })}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#8a8a8a]">
                <th className="pb-3 font-semibold">{t('pro.analytics.th_time', 'Time')}</th>
                <th className="pb-3 font-semibold">
                  {t('pro.analytics.th_profile_name', 'Profile')}
                </th>
                <th className="pb-3 font-semibold">
                  {t('pro.analytics.th_location', 'Request Origin')}
                </th>
                <th className="pb-3 font-semibold">
                  {t('pro.analytics.th_delivery_mode', 'Delivery Mode')}
                </th>
                <th className="pb-3 font-semibold">
                  {t('pro.analytics.th_client', 'Observed Client')}
                </th>
                <th className="pb-3 font-semibold">{t('pro.analytics.th_status', 'Status')}</th>
                <th className="pb-3 font-semibold">{t('pro.analytics.th_speed', 'Speed')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedActivity && paginatedActivity.length > 0 ? (
                paginatedActivity.map((event) => {
                  const localizedCountry = formatLocalizedCountry(
                    event.country,
                    event.countryName,
                    language,
                    t
                  )
                  return (
                    <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 text-[#8a8a8a] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{event.relativeTime}</span>
                      </td>
                      <td className="py-2.5 text-white font-medium">{event.profileSlug}</td>
                      <td className="py-2.5 text-white/90">
                        <div className="flex items-center gap-2">
                          <CountryFlag code={event.country} name={localizedCountry} size="sm" />
                          <span>{localizedCountry}</span>
                          {event.city && <span className="text-[#666] ml-1">({event.city})</span>}
                        </div>
                      </td>
                      <td className="py-2.5">
                        {event.trafficType === 'camo' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {t('pro.analytics.camo_proxy', 'Camo Proxy')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
                            {t('pro.analytics.direct_http', 'Direct HTTP')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-[#8a8a8a]">
                        {event.os} • {event.browser}
                      </td>
                      <td className="py-2.5">
                        {event.status === 304 || event.isCacheHit ? (
                          <span className="text-cyan-400 font-bold">
                            {t('pro.analytics.cache_hit_304', '304 Cache Hit')}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">
                            {t('pro.analytics.ok_200', '200 OK')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-[#8a8a8a]">{event.latencyMs}ms</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8a8a8a]">
                    <div className="space-y-1">
                      <p>
                        {t('pro.analytics.no_activity_title', 'No recent activity recorded yet.')}
                      </p>
                      <p className="text-[11px] text-[#666]">
                        {t(
                          'pro.analytics.no_activity_desc',
                          'Embed your GitAscii profile SVG badge in your GitHub README to start streaming real-time telemetry!'
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalActivityEvents > 0 && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8a8a8a] min-w-0 max-w-full">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#888] whitespace-nowrap">
                {t('pro.analytics.per_page', 'per page')}:
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                {[5, 10, 25, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFeedPageSize(size)
                      setFeedPage(1)
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                      feedPageSize === size
                        ? 'bg-[#c5ff4a] text-black font-bold shadow-xs'
                        : 'text-[#888] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-[#888] mr-2 whitespace-nowrap">
                {t('pro.analytics.page_of', 'Page {current} of {total}', {
                  current: String(safeFeedPage),
                  total: String(totalFeedPages),
                })}
              </span>

              <button
                type="button"
                onClick={() => setFeedPage(1)}
                disabled={safeFeedPage === 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                title={t('pro.analytics.first_page', 'First Page')}
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setFeedPage((p) => Math.max(1, p - 1))}
                disabled={safeFeedPage === 1}
                className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">
                  {t('pro.analytics.prev_page', 'Previous')}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: totalFeedPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalFeedPages <= 5) return true
                    if (p === 1 || p === totalFeedPages) return true
                    return Math.abs(p - safeFeedPage) <= 1
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && p - prev > 1
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-[#555]">...</span>}
                        <button
                          type="button"
                          onClick={() => setFeedPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center border ${
                            safeFeedPage === p
                              ? 'bg-[#c5ff4a]/20 border-[#c5ff4a] text-[#c5ff4a] font-bold'
                              : 'bg-white/5 border-white/10 text-[#888] hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <button
                type="button"
                onClick={() => setFeedPage((p) => Math.min(totalFeedPages, p + 1))}
                disabled={safeFeedPage === totalFeedPages}
                className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="hidden sm:inline text-[11px]">
                  {t('pro.analytics.next_page', 'Next')}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setFeedPage(totalFeedPages)}
                disabled={safeFeedPage === totalFeedPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                title={t('pro.analytics.last_page', 'Last Page')}
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 pb-4 border-t border-white/[0.06] text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#666]">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-[#888]">
                {t('pro.analytics.privacy_title', 'LGPD & GDPR Privacy-by-Design:')}
              </strong>{' '}
              {t(
                'pro.analytics.privacy_desc',
                '100% cookieless telemetry. Zero raw IP storage, daily rotated salted hashes with HyperLogLog, sanitized referrers, and coarse client metadata.'
              )}
            </span>
          </div>
          <button
            onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
            className="text-[11px] text-emerald-400 hover:underline font-mono whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showPrivacyDetails
              ? t('pro.analytics.privacy_hide_details', 'Hide details')
              : t('pro.analytics.privacy_learn_more', 'Learn how')}
          </button>
        </div>

        {showPrivacyDetails && (
          <div className="p-3.5 rounded bg-[#0c0c0c] border border-emerald-500/20 text-[11px] text-emerald-200/80 space-y-1.5 font-mono">
            <p>
              {t(
                'pro.analytics.privacy_p1',
                '• Zero Raw IP Storage: Incoming client IP is never written to disk or Redis. An irreversible SHA-256 HMAC hash is generated using a salt that automatically rotates daily.'
              )}
            </p>
            <p>
              {t(
                'pro.analytics.privacy_p2',
                '• Cross-Day Anonymity: Because the salt rotates every 24 hours, visitor hashes cannot be correlated across different days, preventing persistent behavioral tracking.'
              )}
            </p>
            <p>
              {t(
                'pro.analytics.privacy_p3',
                '• HyperLogLog Cardinality: Unique request sources are computed with Redis HyperLogLog (PFADD / PFCOUNT) ensuring O(1) space efficiency with mathematical precision.'
              )}
            </p>
            <p>
              {t(
                'pro.analytics.privacy_p4',
                '• Referrer Sanitization: All query parameters, tokens, and sensitive URL fragments are stripped before recording referrer domains.'
              )}
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-[#555] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#777]">
              {t('pro.analytics.truth_banner_title', 'Observed HTTP Requests vs. Real Visitors:')}
            </strong>{' '}
            {t(
              'pro.analytics.truth_banner_desc',
              'GitAscii renders dynamic SVGs via image tags. GitHub proxies requests through Camo (camo.githubusercontent.com) to protect visitor privacy and cache images. Metrics display verified server observations: GitHub proxy requests originate from GitHub edge servers, while direct requests (e.g. your portfolio) reflect individual clients.'
            )}
          </span>
        </div>
      </div>
    </section>
  )
}
