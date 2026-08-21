'use client'

import { Terminal } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { useViewModeStore } from '../../store/viewModeStore'
import { GitHubContributionGraph } from './GitHubContributionGraph'
import { GitHubHeader } from './GitHubHeader'
import { GitHubPinnedRepos } from './GitHubPinnedRepos'
import { GitHubProfileSidebar } from './GitHubProfileSidebar'
import { GitHubProfileTabs } from './GitHubProfileTabs'
import { GitHubReadmeCanvas } from './GitHubReadmeCanvas'

export function GitHubModeLayout() {
  const githubData = useEditorStore((state) => state.githubData)
  const config = useEditorStore((state) => state.config)
  const setViewMode = useViewModeStore((state) => state.setViewMode)
  const { t } = useI18n()

  if (!githubData || !config) return null

  const { user } = githubData

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-1.5 bg-[#0d1117] border-b border-[#30363d]/60 text-caption font-inter-tight select-none">
        <div className="flex items-center gap-2 text-[#9198a1]">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] text-[10px] font-semibold uppercase tracking-wider">
            <span>●</span>
            {t('github_mode.banner.badge', 'Preview')}
          </span>
          <span>
            {t(
              'github_mode.banner.description',
              'Visualização de como seu perfil aparecerá no GitHub'
            )}
          </span>
        </div>
        <button
          onClick={() => setViewMode('gitascii')}
          className="inline-flex items-center gap-1.5 text-[#9198a1] hover:text-[#e6edf3] transition-colors cursor-pointer"
        >
          <Terminal size={11} />
          <span>{t('github_mode.banner.back_to_editor', 'Voltar ao Editor')}</span>
        </button>
      </div>

      <GitHubHeader username={user.login} avatarUrl={user.avatar_url} />

      <div className="flex-1 overflow-auto bg-[#0d1117]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 py-6">
            <GitHubProfileSidebar />

            <main className="flex-1 min-w-0">
              <GitHubProfileTabs />
              <GitHubReadmeCanvas />
              <GitHubPinnedRepos />
              <GitHubContributionGraph />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
