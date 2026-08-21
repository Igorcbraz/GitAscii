'use client'

import { Building2, Link2, MapPin, Users } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

export function GitHubProfileSidebar() {
  const githubData = useEditorStore((state) => state.githubData)
  const { t } = useI18n()

  if (!githubData) return null

  const { user } = githubData
  const displayName = user.name || user.login

  return (
    <aside className="w-full lg:w-[296px] shrink-0 px-4 lg:px-6 py-6 space-y-4">
      <div className="relative">
        <img
          src={user.avatar_url}
          alt={displayName}
          className="w-full max-w-[296px] aspect-square rounded-full border-[1px] border-[#30363d] shadow-md"
        />
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#0d1117] border-[1px] border-[#30363d] rounded-full flex items-center justify-center cursor-default">
          <span className="text-lg">😊</span>
        </div>
      </div>

      <div className="space-y-0">
        <h1 className="text-[26px] font-semibold text-[#f0f6fc] leading-tight">{displayName}</h1>
        <p className="text-[20px] font-light text-[#9198a1] leading-tight">
          {user.login}
          {' · '}
          <span className="text-[#9198a1]">he/him</span>
        </p>
      </div>

      {user.bio && <p className="text-sm text-[#f0f6fc] leading-relaxed">{user.bio}</p>}

      <div className="space-y-2">
        <button className="w-full py-[5px] px-4 text-sm font-medium text-[#f0f6fc] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] hover:border-[#8b949e] transition-colors cursor-default">
          {t('github_mode.sidebar.edit_profile', 'Edit profile')}
        </button>
        <button className="w-full py-[5px] px-4 text-sm font-medium text-[#f0f6fc] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] hover:border-[#8b949e] transition-colors cursor-default">
          {t('github_mode.sidebar.sponsors_dashboard', 'Sponsors dashboard')}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#9198a1]">
        <Users size={16} className="text-[#9198a1]" />
        <span>
          <strong className="text-[#f0f6fc]">{user.followers}</strong>{' '}
          {t('github_mode.sidebar.followers', 'followers')}
        </span>
        <span>·</span>
        <span>
          <strong className="text-[#f0f6fc]">{user.following}</strong>{' '}
          {t('github_mode.sidebar.following', 'following')}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {user.company && (
          <div className="flex items-center gap-2 text-[#9198a1]">
            <Building2 size={16} className="shrink-0" />
            <span className="text-[#f0f6fc] hover:text-[#4493f8] hover:underline cursor-default">
              {user.company}
            </span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 text-[#9198a1]">
            <MapPin size={16} className="shrink-0" />
            <span className="text-[#f0f6fc]">{user.location}</span>
          </div>
        )}
        {user.blog && (
          <div className="flex items-center gap-2 text-[#9198a1]">
            <Link2 size={16} className="shrink-0" />
            <span className="text-[#4493f8] hover:underline cursor-default truncate">
              {user.blog}
            </span>
          </div>
        )}
      </div>

      {githubData.socialAccounts && githubData.socialAccounts.length > 0 && (
        <div className="space-y-1 text-sm">
          {githubData.socialAccounts.map((account, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#9198a1]">
              <Link2 size={16} className="shrink-0" />
              <span className="text-[#4493f8] hover:underline cursor-default truncate">
                {account.url}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
