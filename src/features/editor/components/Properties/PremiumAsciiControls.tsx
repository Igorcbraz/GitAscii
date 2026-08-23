'use client'

import { ExternalLink, Sparkles, Terminal } from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'
import { EXTERNAL_LINKS, WIDGET_IDS } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface PremiumAsciiControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function PremiumAsciiControls({ instanceId, widgetId, config }: PremiumAsciiControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)

  const animated = Boolean(config.animated)
  const customName = (config.customName as string) || ''
  const customLocation = (config.customLocation as string) || ''
  const customWebsite = (config.customWebsite as string) || ''

  const isProfileCard = widgetId === WIDGET_IDS.PEDRO_PROFILE_CARD

  return (
    <div className="space-y-4 pt-3 border-t border-graphite" data-testid="pedro-controls">
      {/* Category header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
          <Terminal size={14} />
          <span>ASCII Premium Kit</span>
        </div>
        <a
          href={EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver perfil de Pedro Fonseca (@PedroFnseca)"
          className="flex items-center gap-1 text-caption font-jetbrains-mono text-ash hover:text-signal-lime transition-colors"
        >
          <ExternalLink size={11} />
          <span>PedroFnseca</span>
        </a>
      </div>

      {/* Animation toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-xs bg-void-black border border-graphite">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-body-sm font-inter-tight font-medium text-chalk">
            <Sparkles size={13} className="text-signal-lime" />
            <span>{t('editor.pedro.animatedTitle', 'Animar Números e Barras')}</span>
          </div>
          <p className="text-caption text-ash font-jetbrains-mono">
            {t(
              'editor.pedro.animatedDesc',
              'Efeito progressivo de subida de valores e preenchimento'
            )}
          </p>
        </div>
        <Switch
          checked={animated}
          onChange={(checked: boolean) => updateWidgetConfig(instanceId, { animated: checked })}
          aria-label="Animar números e barras"
        />
      </div>

      {/* Custom identity inputs for Profile Card */}
      {isProfileCard && (
        <div className="space-y-3 pt-2">
          <div className="text-caption uppercase tracking-wider font-jetbrains-mono text-ash font-medium">
            Customização de Identidade
          </div>

          <div>
            <label className="text-caption font-jetbrains-mono text-ash block mb-1">
              Nome de Exibição (Display Name)
            </label>
            <input
              type="text"
              value={customName}
              placeholder="Pedro Fonseca"
              onChange={(e) => updateWidgetConfig(instanceId, { customName: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xs bg-void-black border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-caption font-jetbrains-mono text-ash block mb-1">
              Localização (Location)
            </label>
            <input
              type="text"
              value={customLocation}
              placeholder="Brazil"
              onChange={(e) => updateWidgetConfig(instanceId, { customLocation: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xs bg-void-black border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-caption font-jetbrains-mono text-ash block mb-1">
              Website / Link
            </label>
            <input
              type="text"
              value={customWebsite}
              placeholder="pedrofnseca.me"
              onChange={(e) => updateWidgetConfig(instanceId, { customWebsite: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xs bg-void-black border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export const PedroControls = PremiumAsciiControls
