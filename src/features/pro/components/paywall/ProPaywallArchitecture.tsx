'use client'

import { ArrowRight, Cpu, RefreshCw, ShieldCheck, Terminal, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import React from 'react'

import { useI18n } from '@/i18n'
import { PRO_ARCHITECTURE_NODES } from '../../constants/pricing'

export const ProPaywallArchitecture: React.FC = () => {
  const { t } = useI18n()

  const getIcon = (id: string) => {
    switch (id) {
      case 'shield':
        return ShieldCheck
      case 'terminal':
        return Terminal
      case 'refresh':
        return RefreshCw
      case 'zap':
      default:
        return Zap
    }
  }

  return (
    <div className="relative overflow-hidden border border-graphite/40 bg-onyx/30 p-6 sm:p-8">
      <div className="flex items-center gap-3 pb-6 border-b border-graphite/30">
        <Cpu className="w-4 h-4 text-signal-lime" />
        <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.2em] text-signal-lime font-medium">
          {t('pro.pricing.arch_badge', '[ RELIABILITY & PRIVACY ASSURANCE ]')}
        </span>
        <span className="flex-1 h-px bg-graphite/30" />
        <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash hidden md:block">
          {t('pro.pricing.arch_latency', 'ZERO DATABASE LOCK-IN · 99.9% UPTIME')}
        </span>
      </div>

      <div className="relative pt-12 pb-4">
        {/* Pipeline Data Flow Line (Desktop) */}
        <div className="absolute top-[4.5rem] left-[12%] w-[76%] h-[2px] bg-graphite/30 hidden lg:block overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 h-full w-[25%] bg-gradient-to-r from-transparent via-signal-lime to-transparent"
            animate={{ left: ['-25%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
          {PRO_ARCHITECTURE_NODES.map((node, i) => {
            const IconComponent = getIcon(node.iconId)
            return (
              <div key={i} className="flex flex-col items-center text-center relative group">
                {/* Pipeline Node */}
                <div className="w-12 h-12 rounded-lg bg-onyx border border-graphite group-hover:border-signal-lime/50 flex items-center justify-center mb-6 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
                  <IconComponent className="w-5 h-5 text-ash group-hover:text-signal-lime transition-colors relative z-10" />
                  {/* Node Glow */}
                  <div className="absolute inset-0 rounded-lg bg-signal-lime/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                </div>

                {/* Connecting Arrow for Mobile/Tablet */}
                {i < 3 && (
                  <div className="lg:hidden absolute top-14 left-1/2 -translate-x-1/2 text-graphite mt-2">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}

                {/* Node Content */}
                <div className="w-full bg-carbon/50 border border-graphite/40 hover:border-graphite/80 p-5 rounded-lg transition-colors h-full flex flex-col items-center">
                  <div className="font-jetbrains-mono text-[9px] text-signal-lime font-semibold tracking-widest mb-3 uppercase px-2.5 py-1 bg-signal-lime/5 rounded-full border border-signal-lime/10">
                    {t(node.num, node.defaultNum)}
                  </div>
                  <h4 className="font-inter-tight font-semibold text-[14px] text-chalk mb-2">
                    {t(node.title, node.defaultTitle)}
                  </h4>
                  <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                    {t(node.desc, node.defaultDesc)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
