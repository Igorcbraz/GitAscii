'use client'

import { Bell, ChevronDown, Menu, Plus, Search } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

interface GitHubHeaderProps {
  username: string
  avatarUrl: string
}

export function GitHubHeader({ username, avatarUrl }: GitHubHeaderProps) {
  const { t } = useI18n()

  return (
    <header className="w-full bg-[#010409] border-b border-[#30363d] px-4 lg:px-6 h-[62px] flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-[#f0f6fc] p-1 cursor-default"
          aria-label={t('common.toggle_menu', 'Toggle menu')}
        >
          <Menu size={16} />
        </button>

        <svg
          height="32"
          viewBox="0 0 16 16"
          width="32"
          className="fill-[#f0f6fc] shrink-0"
          aria-hidden="true"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>

        <span className="text-sm font-semibold text-[#f0f6fc] hidden sm:block">{username}</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-[272px] lg:max-w-[544px] mx-4">
        <div className="w-full flex items-center h-[30px] bg-[#010409] border border-[#30363d] rounded-md px-3 text-[13px] text-[#9198a1]">
          <Search size={16} className="shrink-0 mr-2 opacity-70" />
          <span>{t('github_mode.header.search_placeholder', 'Type / to search')}</span>
          <div className="ml-auto flex items-center">
            <kbd className="border border-[#30363d] rounded px-1 text-[11px] text-[#9198a1] font-sans">
              /
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-[#f0f6fc] mr-2">
          <span className="hover:text-[#9198a1] transition-colors cursor-default">
            {t('github_mode.header.pull_requests', 'Pull requests')}
          </span>
          <span className="hover:text-[#9198a1] transition-colors cursor-default">
            {t('github_mode.header.issues', 'Issues')}
          </span>
          <span className="hover:text-[#9198a1] transition-colors cursor-default">
            {t('github_mode.header.marketplace', 'Marketplace')}
          </span>
          <span className="hover:text-[#9198a1] transition-colors cursor-default">
            {t('github_mode.header.explore', 'Explore')}
          </span>
        </nav>

        <button
          className="text-[#f0f6fc] hover:text-[#9198a1] transition-colors p-1 cursor-default relative"
          aria-label={t('github_mode.header.notifications', 'Notifications')}
        >
          <Bell size={16} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#1f6feb] rounded-full" />
        </button>

        <button
          className="flex items-center text-[#f0f6fc] hover:text-[#9198a1] transition-colors cursor-default"
          aria-label={t('github_mode.header.create_new', 'Create new')}
        >
          <Plus size={16} />
          <ChevronDown size={12} className="ml-0.5" />
        </button>

        <button
          className="cursor-default"
          aria-label={t('github_mode.header.view_profile', 'View profile')}
        >
          <img
            src={avatarUrl}
            alt={username}
            className="w-[20px] h-[20px] rounded-full border border-[#30363d]"
          />
        </button>
      </div>
    </header>
  )
}
