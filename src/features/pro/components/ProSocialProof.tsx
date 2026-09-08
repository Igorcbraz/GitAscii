'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

export interface ProSocialProofProps {
  count: number
  usernames: string[]
  variant?: 'hero' | 'inline' | 'dashboard'
}

const INITIAL_PALETTES = [
  { bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' },
  { bg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' },
  { bg: 'bg-violet-950/80 border-violet-500/40 text-violet-300' },
  { bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300' },
  { bg: 'bg-rose-950/80 border-rose-500/40 text-rose-300' },
  { bg: 'bg-lime-950/80 border-signal-lime/50 text-signal-lime' },
]

function getPalette(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return INITIAL_PALETTES[Math.abs(hash) % INITIAL_PALETTES.length]
}

function AvatarBubble({
  username,
  index,
  size,
}: {
  username: string
  index: number
  size: number
}) {
  const [failed, setFailed] = useState(false)
  const cleanUsername = username?.trim() || 'User'
  const initial = cleanUsername.charAt(0).toUpperCase()
  const palette = getPalette(cleanUsername)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.7 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        width: size,
        height: size,
        marginLeft: index === 0 ? 0 : -(size * 0.28),
        zIndex: 20 - index,
      }}
      className="relative rounded-full border-2 border-carbon ring-1 ring-signal-lime/30 overflow-hidden bg-graphite shrink-0 shadow-sm"
      title={`@${cleanUsername}`}
    >
      {failed ? (
        <div
          className={`w-full h-full flex items-center justify-center font-jetbrains-mono font-bold select-none border ${palette.bg}`}
          style={{ fontSize: Math.max(10, Math.round(size * 0.44)) }}
        >
          {initial}
        </div>
      ) : (
        <Image
          src={`https://avatars.githubusercontent.com/${cleanUsername}?s=48`}
          alt={`@${cleanUsername}`}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          unoptimized
        />
      )}
    </motion.div>
  )
}

export function ProSocialProof({ count, usernames, variant = 'inline' }: ProSocialProofProps) {
  const { t } = useI18n()
  const fallbackUsernames = ['Igorcbraz', 'schunckleonardo', 'developit']
  const effectiveCount = count > 0 ? count : usernames.length > 0 ? usernames.length : 3
  const effectiveUsernames = usernames.length > 0 ? usernames : fallbackUsernames

  const isHero = variant === 'hero'
  const isDashboard = variant === 'dashboard'
  const avatarSize = isHero ? 36 : 28
  const displayUsernames = effectiveUsernames.slice(0, isHero ? 7 : 5)
  const remaining = Math.max(0, effectiveCount - displayUsernames.length)

  const label = isDashboard
    ? t(
        'pro.social_proof.dashboard',
        `You're part of an exclusive group of {count} Pro developers`,
        { count: String(effectiveCount) }
      )
    : effectiveCount === 1
      ? t('pro.social_proof.first', 'Join the first verified GitAscii Pro developer')
      : t(
          'pro.social_proof.unlocked',
          effectiveCount < 10
            ? `${effectiveCount} developers already unlocked GitAscii Pro`
            : `${effectiveCount}+ developers already unlocked GitAscii Pro`,
          { count: effectiveCount < 10 ? String(effectiveCount) : `${effectiveCount}+` }
        )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-3 ${isHero ? 'flex-col sm:flex-row' : 'flex-row'}`}
    >
      <div className="flex items-center">
        {displayUsernames.map((u, i) => (
          <AvatarBubble key={u} username={u} index={i} size={avatarSize} />
        ))}
        {remaining > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: displayUsernames.length * 0.07 + 0.1, duration: 0.3 }}
            style={{
              width: avatarSize,
              height: avatarSize,
              marginLeft: -(avatarSize * 0.28),
              zIndex: 1,
              fontSize: avatarSize * 0.3,
            }}
            className="relative rounded-full border-2 border-carbon bg-onyx ring-1 ring-signal-lime/30 flex items-center justify-center font-jetbrains-mono text-signal-lime font-bold shrink-0"
          >
            +{remaining > 99 ? '99' : remaining}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={`font-inter-tight leading-snug ${
            isHero ? 'text-[13px] text-bone/80' : 'text-[11px] sm:text-[12px] text-ash'
          }`}
        >
          {label}
        </motion.span>
        {!isDashboard && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-1 font-jetbrains-mono text-[9px] uppercase tracking-widest text-signal-lime/70 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse shadow-[0_0_6px_rgba(197,255,74,0.8)]" />
            live
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}
