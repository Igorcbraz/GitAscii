'use client'

import { Layout, Paintbrush, Sparkles, Terminal, Users, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { FeatureCard } from '@/components/ui/grid-feature-cards'
import { useI18n } from '@/i18n'

export function FeaturesGrid() {
  const { t } = useI18n()

  const features = [
    {
      title: t('landing.features.visual_editor.title', 'Visual Editor'),
      icon: Paintbrush,
      description: t(
        'landing.features.visual_editor.desc',
        'Drag-and-drop editor inspired by Canva and Figma. See every change in real-time.'
      ),
    },
    {
      title: t('landing.features.ascii_art.title', 'ASCII Art Engine'),
      icon: Terminal,
      description: t(
        'landing.features.ascii_art.desc',
        'Convert any image to stunning ASCII art with 6+ character sets, adjustable density and color.'
      ),
    },
    {
      title: t('landing.features.templates.title', 'Premium Templates'),
      icon: Layout,
      description: t(
        'landing.features.templates.desc',
        '13+ handcrafted templates. From Terminal to Cyberpunk. One-click apply, fully customizable.'
      ),
    },
    {
      title: t('landing.features.live_rendering.title', 'Live Rendering'),
      icon: Zap,
      description: t(
        'landing.features.live_rendering.desc',
        'Your SVG is served via URL — always up to date. No manual uploads, no stale data.'
      ),
    },
    {
      title: t('landing.features.multiple_profiles.title', 'Multiple Profiles'),
      icon: Users,
      description: t(
        'landing.features.multiple_profiles.desc',
        'Create different profiles for different purposes. Portfolio, Resume, Open Source — all from one account.'
      ),
    },
    {
      title: t('landing.features.smart_gen.title', 'Smart Generation'),
      icon: Sparkles,
      description: t(
        'landing.features.smart_gen.desc',
        'Let GitAscii analyze your GitHub and generate the perfect profile automatically.'
      ),
    },
  ]

  return (
    <section id="features" className="py-16 md:py-32 relative z-10 w-full bg-carbon">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-6 md:px-12">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash mb-4 block">
            {t('landing.features.eyebrow', '[ WHY GITASCII ]')}
          </span>
          <h2 className="font-pt-serif font-light text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.features.title_normal', 'Everything You ')}
            <em className="italic text-signal-lime">
              {t('landing.features.title_italic', 'Need.')}
            </em>
          </h2>
          <p className="font-inter-tight text-body text-bone leading-body max-w-lg mx-auto mt-4">
            {t(
              'landing.features.subtitle',
              'Everything you need to build, customize, and share beautiful GitHub profiles.'
            )}
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  )
}

type ViewAnimationProps = {
  delay?: number
  className?: React.ComponentProps<typeof motion.div>['className']
  children: React.ReactNode
}

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)
    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches)
    }
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      animate={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
