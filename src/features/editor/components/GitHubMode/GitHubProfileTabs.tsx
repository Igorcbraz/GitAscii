'use client'

import { BookOpen, FolderGit2, Kanban, Package, Star } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

export function GitHubProfileTabs() {
  const githubData = useEditorStore((state) => state.githubData)
  const config = useEditorStore((state) => state.config)
  const { t } = useI18n()

  if (!githubData || !config) return null

  const { user, repos, totalStars } = githubData
  const repoCount = user.public_repos || repos.length
  const starCount = totalStars || 0

  const tabs = [
    { label: t('github_mode.tabs.overview', 'Overview'), icon: BookOpen, active: true },
    {
      label: t('github_mode.tabs.repositories', 'Repositories'),
      icon: FolderGit2,
      count: repoCount,
    },
    { label: t('github_mode.tabs.projects', 'Projects'), icon: Kanban, count: 0 },
    { label: t('github_mode.tabs.packages', 'Packages'), icon: Package, count: 0 },
    { label: t('github_mode.tabs.stars', 'Stars'), icon: Star, count: starCount },
  ]

  return (
    <div>
      <nav className="border-b border-[#30363d] mb-6">
        <div className="flex items-center gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.label}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-default ${
                  tab.active ? 'text-[#f0f6fc]' : 'text-[#9198a1] hover:text-[#f0f6fc]'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-[#30363d] rounded-full min-w-[20px] text-center">
                    {tab.count}
                  </span>
                )}
                {tab.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f78166] rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
