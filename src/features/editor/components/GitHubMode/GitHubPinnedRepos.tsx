'use client'

import { BookMarked, GitFork, Star } from 'lucide-react'
import React from 'react'

import { LANGUAGE_COLORS } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

export function GitHubPinnedRepos() {
  const githubData = useEditorStore((state) => state.githubData)
  const { t } = useI18n()

  if (!githubData) return null

  const { repos } = githubData

  const pinnedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6)

  if (pinnedRepos.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-normal text-[#9198a1]">
          {t('github_mode.pinned.title', 'Pinned')}
        </h2>
        <span className="text-xs text-[#4493f8] hover:underline cursor-default">
          {t('github_mode.pinned.customize', 'Customize your pins')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pinnedRepos.map((repo) => (
          <div
            key={repo.id}
            className="p-4 border border-[#30363d] rounded-md bg-[#0d1117] hover:border-[#8b949e] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookMarked size={16} className="text-[#9198a1] shrink-0" />
              <span className="text-sm font-semibold text-[#4493f8] hover:underline cursor-default truncate">
                {repo.name}
              </span>
              <span className="shrink-0 px-1.5 py-0 text-xs font-medium text-[#9198a1] border border-[#30363d] rounded-full">
                {t('github_mode.pinned.public', 'Public')}
              </span>
            </div>
            {repo.description && (
              <p className="text-xs text-[#9198a1] leading-relaxed mb-3 line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-[#9198a1]">
              {repo.language && (
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#9198a1' }}
                  />
                  <span>{repo.language}</span>
                </div>
              )}
              {repo.stargazers_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} />
                  <span>{repo.stargazers_count}</span>
                </div>
              )}
              {repo.forks_count > 0 && (
                <div className="flex items-center gap-1">
                  <GitFork size={14} />
                  <span>{repo.forks_count}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
