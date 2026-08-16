'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { FeatureCard } from '@/components/ui/grid-feature-cards'
import { FEATURES_GRID_LIST } from '@/constants'
import { useI18n } from '@/i18n'

export function FeaturesGrid() {
  const { t } = useI18n()

  const features = FEATURES_GRID_LIST.map((f) => ({
    title: t(f.titleKey, f.titleDef),
    icon: f.icon,
    description: t(f.descKey, f.descDef),
  }))

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
