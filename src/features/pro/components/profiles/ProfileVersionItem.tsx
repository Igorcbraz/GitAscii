import { Clock, History, Layers, RotateCcw } from 'lucide-react'
import React from 'react'

import type { ProfileVersionRecord, ProProfileRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface ProfileVersionItemProps {
  version: ProfileVersionRecord
  index: number
  profile: ProProfileRecord
  isPreviewLoaded: boolean
  onLoadPreview: () => void
  onRestore: () => void
  translate: (key: string, defaultValue: string, values?: Record<string, string>) => string
}

export const ProfileVersionItem: React.FC<ProfileVersionItemProps> = React.memo(
  ({ version, index, profile, isPreviewLoaded, onLoadPreview, onRestore, translate }) => {
    const isLatest = index === 0
    const isGitCommit = /^[0-9a-f]{40}$/i.test(version.id)
    const previewUrl =
      isGitCommit && profile.rawSvgUrl
        ? profile.rawSvgUrl.replace('/gitascii/', `/${version.id}/`)
        : null
    const formattedDate = new Date(version.createdAt).toLocaleString()

    return (
      <div
        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLatest
            ? 'bg-white/[0.04] border-[#c5ff4a]/40 shadow-xs'
            : 'bg-[#141414] border-white/[0.08] hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-4 min-w-0 w-full">
          {previewUrl ? (
            <button
              type="button"
              className="w-48 h-32 sm:w-64 sm:h-44 shrink-0 bg-black border border-white/10 rounded overflow-hidden hidden sm:flex flex-col items-center justify-center cursor-pointer hover:border-[#c5ff4a]/50 transition-colors"
              onClick={onLoadPreview}
            >
              {isPreviewLoaded ? (
                <img
                  src={previewUrl}
                  alt="Version Preview"
                  className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/70 transition-colors">
                  <Layers className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Load Preview
                  </span>
                </span>
              )}
            </button>
          ) : (
            <div className="w-48 h-32 sm:w-64 sm:h-44 shrink-0 bg-white/5 border border-white/10 rounded hidden sm:flex flex-col items-center justify-center p-1 overflow-hidden">
              <History className="w-6 h-6 text-white/20 mb-2" />
              <span className="text-[10px] text-white/30 uppercase tracking-wider">No Preview</span>
            </div>
          )}

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                v{version.versionNumber}
              </span>
              <h4 className="text-xs font-semibold text-white truncate">
                {version.label ||
                  translate('pro.profiles.version_number', 'Version {num}', {
                    num: String(version.versionNumber),
                  })}
              </h4>
              {isLatest && (
                <ProBadge variant="lime" size="sm">
                  {translate('pro.versions.current_active', 'Current Active')}
                </ProBadge>
              )}
            </div>

            {version.description && (
              <p className="text-[11px] text-[#8a8a8a] line-clamp-2">{version.description}</p>
            )}

            <div className="flex items-center gap-3 text-[10px] font-mono text-[#7a7a7a]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#c5ff4a]" />
                {version.widgetsCount} {translate('pro.common.widgets', 'widgets')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isLatest && (
            <button
              onClick={onRestore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer hover:border-[#c5ff4a]/50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c5ff4a]" />
              <span>{translate('pro.versions.restore_btn', 'Restore')}</span>
            </button>
          )}
        </div>
      </div>
    )
  }
)

ProfileVersionItem.displayName = 'ProfileVersionItem'
