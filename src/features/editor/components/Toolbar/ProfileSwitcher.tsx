'use client'

import { Check, ChevronDown, Lock, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { safeStorage } from '@/utils/storage'

import { useEditorStore } from '../../store/editorStore'

interface ProfileSwitcherProps {
  username?: string
  currentProfileSlug?: string
}

interface ProfileItem {
  slug: string
  name: string
  isDefault?: boolean
}

interface SessionData {
  username: string
  isPro?: boolean
  tier?: string
}

export function ProfileSwitcher({
  username,
  currentProfileSlug = 'default',
}: ProfileSwitcherProps) {
  const { t } = useI18n()
  const router = useRouter()
  const storeSession = useEditorStore((state) => state.session)
  const [isOpen, setIsOpen] = useState(false)
  const [isProUser, setIsProUser] = useState<boolean | null>(null)
  const [profiles, setProfiles] = useState<ProfileItem[]>([
    { slug: 'default', name: 'Default', isDefault: true },
  ])
  const [newSlugInput, setNewSlugInput] = useState('')
  const [newNameInput, setNewNameInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const effectiveUsername = username || storeSession?.username

  const loadProfiles = useCallback(async () => {
    try {
      const isMockActive = safeStorage.getItem('gitascii_pro_mock_active') === 'true'
      let isPro = isMockActive

      const sessionRes = await fetch(API_ENDPOINTS.AUTH.SESSION)
      if (sessionRes.ok) {
        const sessionData: { session?: SessionData } = await sessionRes.json()
        if (sessionData?.session) {
          isPro = Boolean(
            isMockActive ||
            sessionData.session.isPro ||
            (sessionData.session.tier && sessionData.session.tier !== 'free')
          )
        }
      }
      setIsProUser(isPro)

      const discoveredMap = new Map<string, ProfileItem>()
      discoveredMap.set('default', { slug: 'default', name: 'Default', isDefault: true })

      try {
        const res = await fetch(API_ENDPOINTS.PRO.PROFILES)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data?.profiles)) {
            for (const p of data.profiles) {
              const slug = (p.slug || '').toLowerCase().trim()
              if (slug) {
                discoveredMap.set(slug, {
                  slug,
                  name: p.name || slug,
                  isDefault: Boolean(p.isDefault || slug === 'default'),
                })
              }
            }
          }
        }
      } catch {
        // Fallback to local storage
      }

      if (effectiveUsername) {
        const storedKey = `gitascii_user_profiles_${effectiveUsername}`
        const stored = safeStorage.getItem(storedKey)
        if (stored) {
          try {
            const list: (string | ProfileItem)[] = JSON.parse(stored)
            for (const item of list) {
              const slug = (typeof item === 'string' ? item : item.slug).toLowerCase().trim()
              if (slug && !discoveredMap.has(slug)) {
                discoveredMap.set(slug, {
                  slug,
                  name: typeof item === 'string' ? slug : item.name || slug,
                  isDefault: slug === 'default',
                })
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      const current = (currentProfileSlug || 'default').toLowerCase().trim()
      if (current && !discoveredMap.has(current)) {
        discoveredMap.set(current, {
          slug: current,
          name: current === 'default' ? 'Default' : current,
          isDefault: current === 'default',
        })
      }

      const mergedList = Array.from(discoveredMap.values())
      setProfiles(mergedList)
    } catch {
      setIsProUser(false)
    }
  }, [effectiveUsername, currentProfileSlug])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setIsCreating(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleProfileSwitch = (slug: string) => {
    setIsOpen(false)
    if (!effectiveUsername) return

    if (slug === 'default') {
      router.push(`/${effectiveUsername}`)
    } else {
      router.push(`/${effectiveUsername}/${slug}`)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanSlug = newSlugInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
    if (!cleanSlug || !effectiveUsername) return

    const profileName = newNameInput.trim() || cleanSlug
    setIsSubmitting(true)

    try {
      await fetch(API_ENDPOINTS.PRO.PROFILES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: cleanSlug,
          name: profileName,
          description: '',
        }),
      })
    } catch (err) {
      console.warn('Could not persist profile to server:', err)
    }

    const updated = [
      ...profiles.filter((p) => p.slug !== cleanSlug),
      { slug: cleanSlug, name: profileName, isDefault: false },
    ]
    setProfiles(updated)

    if (effectiveUsername) {
      safeStorage.setItem(
        `gitascii_user_profiles_${effectiveUsername}`,
        JSON.stringify(updated.map((p) => ({ slug: p.slug, name: p.name })))
      )
    }

    setNewSlugInput('')
    setNewNameInput('')
    setIsSubmitting(false)
    setIsCreating(false)
    setIsOpen(false)
    router.push(`/${effectiveUsername}/${cleanSlug}`)
  }

  if (!isProUser) {
    return (
      <Link
        href="/pro"
        className="group inline-flex items-center gap-1.5 px-2 h-[30px] rounded-xs bg-transparent hover:bg-white/5 border border-transparent hover:border-graphite/40 transition-all duration-150 cursor-pointer select-none"
        title={t(
          'editor.profile_switcher.pro_only_tooltip',
          'Multi-Profiles is exclusive to GitAscii Pro. Click to unlock!'
        )}
      >
        <span className="font-jetbrains-mono text-[10px] text-ash/70 group-hover:text-ash uppercase tracking-wider">
          {t('editor.profile_switcher.profile_label', 'profile')}:
        </span>
        <span className="font-jetbrains-mono text-[11px] text-fog group-hover:text-white transition-colors">
          {currentProfileSlug}
        </span>
        <span className="inline-flex items-center gap-0.5 text-signal-lime/80 group-hover:text-signal-lime font-mono text-[9px] font-semibold tracking-wider ml-0.5 transition-colors">
          <Lock size={8} className="shrink-0" />
          <span>PRO</span>
        </span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-2 h-[30px] rounded-xs bg-transparent hover:bg-white/5 border border-transparent hover:border-graphite/40 transition-all duration-150 cursor-pointer select-none"
        title={t('editor.profile_switcher.switch_title', 'Switch profile')}
      >
        <span className="font-jetbrains-mono text-[10px] text-ash/70 uppercase tracking-wider">
          {t('editor.profile_switcher.profile_label', 'profile')}:
        </span>
        <span className="font-jetbrains-mono text-[11px] font-medium text-white max-w-[100px] truncate">
          {currentProfileSlug}
        </span>
        <ChevronDown
          size={11}
          className={`text-ash/60 ml-0.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-signal-lime' : 'group-hover:text-white'}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-[500] w-60 bg-void-black/95 backdrop-blur-md border border-graphite/80 rounded-xs shadow-[0_12px_32px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-graphite/60 flex items-center justify-between">
            <span className="font-inter-tight text-[10px] uppercase font-bold tracking-wider text-ash flex items-center gap-1.5">
              <Sparkles size={10} className="text-signal-lime" />
              {t('editor.profile_switcher.pro_profiles', 'Pro Profiles')}
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-xs text-signal-lime font-medium border border-signal-lime/20 bg-signal-lime/5">
              {profiles.length} / 10
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {profiles.map((p) => {
              const isCurrent = p.slug === currentProfileSlug
              return (
                <button
                  key={p.slug}
                  onClick={() => handleProfileSwitch(p.slug)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-signal-lime/10 text-signal-lime font-medium'
                      : 'text-chalk hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-jetbrains-mono text-[11.5px] truncate">
                      {p.name || p.slug}
                    </div>
                    {p.name && p.name !== p.slug && (
                      <div className="font-jetbrains-mono text-[9.5px] text-ash/70 truncate">
                        /{p.slug}
                      </div>
                    )}
                  </div>
                  {isCurrent && <Check size={12} className="text-signal-lime shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="p-2 border-t border-graphite/60">
            {isCreating ? (
              <form onSubmit={handleCreateProfile} className="space-y-1.5">
                <input
                  type="text"
                  autoFocus
                  required
                  value={newSlugInput}
                  onChange={(e) => setNewSlugInput(e.target.value)}
                  placeholder={t(
                    'editor.profile_switcher.slug_placeholder',
                    'slug: e.g. work, gaming'
                  )}
                  className="w-full px-2 py-1 bg-carbon border border-graphite rounded-xs font-jetbrains-mono text-label text-white focus:outline-none focus:border-signal-lime placeholder:text-ash/50"
                />
                <input
                  type="text"
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  placeholder={t('editor.profile_switcher.name_placeholder', 'Name (optional)')}
                  className="w-full px-2 py-1 bg-carbon border border-graphite rounded-xs font-jetbrains-mono text-label text-white focus:outline-none focus:border-signal-lime placeholder:text-ash/50"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-1 rounded-xs bg-signal-lime text-black font-inter-tight font-semibold text-caption hover:brightness-110 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? t('common.creating', 'Creating...')
                      : t('common.create', 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 rounded-xs bg-graphite text-ash font-inter-tight text-caption hover:text-white cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xs border border-dashed border-graphite/70 hover:border-signal-lime/50 text-ash/80 hover:text-signal-lime bg-transparent font-inter-tight text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Plus size={11} />
                <span>{t('editor.profile_switcher.new_profile', '+ New Profile')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
