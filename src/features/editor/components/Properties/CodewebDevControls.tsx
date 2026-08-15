import {
  Check,
  Cloud,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Plus,
  Search,
  Server,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Upload,
  User,
  X,
} from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { EXTERNAL_LINKS, WIDGET_IDS } from '@/constants'
import { TECH_CATALOG } from '@/data/techCatalog'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { normalizeUrl } from '@/utils/url'

import { useEditorStore } from '../../store/editorStore'

interface CodewebDevControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

const ALL_PLATFORMS = [
  { id: 'github', label: 'GitHub' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'discord', label: 'Discord' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'portfolio', label: 'Portfolio / Web' },
  { id: 'repositories', label: 'Repositories' },
  { id: 'stars', label: 'Total Stars' },
  { id: 'followers', label: 'Followers' },
]

export function CodewebDevControls({ instanceId, widgetId, config }: CodewebDevControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const [newTagInput, setNewTagInput] = useState('')

  const handleUpdate = (patch: Record<string, unknown>) => {
    updateWidgetConfig(instanceId, patch)
  }

  if (widgetId === WIDGET_IDS.CODEWEB_SOCIAL_BADGE) {
    const renderMode = (config.renderMode as 'single' | 'multi' | 'grid') || 'multi'
    const platform = (config.platform as string) || 'github'
    const customLabel = (config.customLabel as string) || ''
    const animSpeed = (config.animSpeed as string) || '8s'
    const showIcons = config.showIcons !== false
    const showText = config.showText !== false
    const staticMode = Boolean(config.staticMode)
    const gridColumns = Number(config.gridColumns) || 2

    const activePlatforms =
      Array.isArray(config.platforms) && config.platforms.length > 0
        ? (config.platforms as string[])
        : ['github', 'instagram', 'facebook', 'gmail']

    const togglePlatform = (pId: string) => {
      let updated: string[]
      if (activePlatforms.includes(pId)) {
        updated = activePlatforms.filter((p) => p !== pId)
        if (updated.length === 0) updated = ['github']
      } else {
        updated = [...activePlatforms, pId]
      }
      handleUpdate({ platforms: updated })
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Share2 size={14} />
          <span>{t('editor.codeweb.social_title', 'Aura Social Badge Customization')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1.5 font-medium">
            {t('editor.codeweb.layout_mode', 'Display Layout Mode')}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleUpdate({ renderMode: 'multi' })}
              className={`py-1.5 rounded-xs text-[11px] transition-all cursor-pointer border text-center ${
                renderMode === 'multi'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {t('editor.codeweb.mode_strip', 'Strip (Row)')}
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ renderMode: 'grid' })}
              className={`py-1.5 rounded-xs text-[11px] transition-all cursor-pointer border text-center ${
                renderMode === 'grid'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {t('editor.codeweb.mode_grid', 'Grid (Matrix)')}
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ renderMode: 'single' })}
              className={`py-1.5 rounded-xs text-[11px] transition-all cursor-pointer border text-center ${
                renderMode === 'single'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {t('editor.codeweb.mode_single', 'Single Pill')}
            </button>
          </div>
        </div>

        {renderMode === 'grid' && (
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-medium">
              {t('editor.codeweb.grid_columns', 'Grid Columns')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => handleUpdate({ gridColumns: cols })}
                  className={`py-1 rounded-xs text-eyebrow border transition-all cursor-pointer ${
                    gridColumns === cols
                      ? 'bg-signal-lime text-black border-signal-lime font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-slate'
                  }`}
                >
                  {t('editor.codeweb.columns_count', '{count} Columns', { count: String(cols) })}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-graphite">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow text-ash">
              {t('editor.codeweb.show_icons', 'Show Platform Icons')}
            </span>
            <Switch
              checked={showIcons}
              onChange={(checked: boolean) => handleUpdate({ showIcons: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-eyebrow text-ash">
              {t('editor.codeweb.show_text', 'Show Text Labels')}
            </span>
            <Switch
              checked={showText}
              onChange={(checked: boolean) => handleUpdate({ showText: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-eyebrow text-ash">
              {t('editor.codeweb.static_mode', 'Static Mode (No Animation)')}
            </span>
            <Switch
              checked={staticMode}
              onChange={(checked: boolean) => handleUpdate({ staticMode: checked })}
            />
          </div>
        </div>

        {renderMode === 'single' ? (
          <div className="space-y-3 pt-2 border-t border-graphite">
            <div>
              <label className="text-eyebrow text-ash block mb-1 font-medium">
                {t('editor.codeweb.active_platform', 'Active Platform')}
              </label>
              <select
                value={platform}
                onChange={(e) => handleUpdate({ platform: e.target.value })}
                className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
              >
                {ALL_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-eyebrow text-ash block mb-1 font-medium">
                {t('editor.codeweb.custom_label', 'Custom Label (optional)')}
              </label>
              <input
                type="text"
                value={customLabel}
                placeholder="e.g. @yourhandle or Join Discord"
                onChange={(e) => handleUpdate({ customLabel: e.target.value })}
                className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-graphite">
            <label className="text-eyebrow text-ash block mb-1 font-medium">
              {t('editor.codeweb.enabled_networks', 'Enabled Social Networks')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_PLATFORMS.map((p) => {
                const isActive = activePlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`py-1 px-2 rounded-xs text-[11px] font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-signal-lime/15 text-signal-lime border-signal-lime/60'
                        : 'bg-graphite text-ash/60 border-graphite hover:border-slate'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px]">{isActive ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-eyebrow text-ash block font-medium">
                {t('editor.codeweb.custom_labels_active', 'Custom Labels for Active Platforms')}
              </label>
              {activePlatforms.map((pKey) => {
                const pDef = ALL_PLATFORMS.find((x) => x.id === pKey)
                const val = (config[`label_${pKey}`] as string) || ''
                return (
                  <div key={pKey} className="flex items-center gap-2">
                    <span className="text-caption text-ash w-24 shrink-0 truncate">
                      {pDef?.label}:
                    </span>
                    <input
                      type="text"
                      value={val}
                      placeholder={pDef?.label}
                      onChange={(e) => handleUpdate({ [`label_${pKey}`]: e.target.value })}
                      className="w-full bg-graphite border border-graphite rounded-xs px-2 py-1 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!staticMode && (
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-medium">
              {t('editor.codeweb.rot_speed', 'Rotation Animation Speed')}
            </label>
            <select
              value={animSpeed}
              onChange={(e) => handleUpdate({ animSpeed: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            >
              <option value="4s">{t('editor.codeweb.speed_fast', 'Fast (4s)')}</option>
              <option value="8s">{t('editor.codeweb.speed_normal', 'Normal (8s)')}</option>
              <option value="14s">{t('editor.codeweb.speed_slow', 'Smooth & Slow (14s)')}</option>
              <option value="20s">{t('editor.codeweb.speed_ultra', 'Ultra Slow (20s)')}</option>
            </select>
          </div>
        )}
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.CODEWEB_HERO_ORBIT) {
    const title = (config.title as string) || ''
    const subtitle = (config.subtitle as string) || ''
    const rawTags = Array.isArray(config.tags)
      ? (config.tags as string[])
      : ['Minimalism', 'Open Source', 'Web']
    const staticMode = Boolean(config.staticMode)

    const addTag = () => {
      if (!newTagInput.trim()) return
      handleUpdate({ tags: [...rawTags, newTagInput.trim()] })
      setNewTagInput('')
    }

    const removeTag = (index: number) => {
      const updated = rawTags.filter((_, i) => i !== index)
      handleUpdate({ tags: updated })
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Sparkles size={14} />
          <span>{t('editor.codeweb.hero_title', 'Aura Hero Orbit Customization')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.headline', 'Main Headline / Name')}
          </label>
          <input
            type="text"
            value={title}
            placeholder="ALIEN / YOUR NAME"
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.subtitle', 'Subtitle / Role Badge')}
          </label>
          <input
            type="text"
            value={subtitle}
            placeholder="DESIGNER / FULLSTACK CREATOR"
            onChange={(e) => handleUpdate({ subtitle: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-graphite">
          <label className="text-eyebrow text-ash block font-medium">
            {t('editor.codeweb.dynamic_tags', 'Dynamic Technologies / Tags Pills')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {rawTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-void-black border border-graphite text-caption text-chalk"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newTagInput}
              placeholder={t(
                'editor.codeweb.add_skill_placeholder',
                'Add skill or badge (e.g. Next.js)...'
              )}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
            <button
              type="button"
              onClick={addTag}
              className="p-1.5 bg-signal-lime text-black rounded-xs hover:bg-signal-lime/80 transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-graphite">
          <span className="text-eyebrow text-ash">
            {t('editor.codeweb.static_mode', 'Static Mode (No Animation)')}
          </span>
          <Switch
            checked={staticMode}
            onChange={(checked: boolean) => handleUpdate({ staticMode: checked })}
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.CODEWEB_SHOWCASE_CARDS) {
    const aboutTag = (config.aboutTag as string) ?? (config.status as string) ?? 'about'
    const titleLine1 =
      (config.titleLine1 as string) ?? (config.title as string) ?? 'Building things'
    const titleLine2 = (config.titleLine2 as string) ?? (config.role as string) ?? 'that matter.'
    const terminalText = (config.terminalText as string) ?? '> open to collaborations'
    const leftGifUrl = (config.leftGifUrl as string) ?? EXTERNAL_LINKS.CODEWEB_DEFAULT_GIFS.LEFT

    const card1Icon = (config.card1Icon as string) ?? 'Target'
    const card1Text = (config.card1Text as string) ?? 'always learning'
    const card1GifUrl = (config.card1GifUrl as string) ?? EXTERNAL_LINKS.CODEWEB_DEFAULT_GIFS.CARD1

    const card2Icon = (config.card2Icon as string) ?? 'Star'
    const card2Text = (config.card2Text as string) ?? 'craft matters'
    const card2GifUrl = (config.card2GifUrl as string) ?? EXTERNAL_LINKS.CODEWEB_DEFAULT_GIFS.CARD2

    const staticMode = Boolean(config.staticMode)

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Layers size={14} />
          <span>{t('editor.codeweb.showcase_title', 'Aura Showcase Cards')}</span>
        </div>

        <div className="space-y-3 p-3 bg-carbon/60 border border-graphite rounded-xs">
          <span className="text-eyebrow text-signal-lime font-semibold uppercase tracking-wider block">
            {t('editor.codeweb.card_main', 'Card Principal (Esquerda)')}
          </span>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.tag_pill', 'Tag / Pill')}
            </label>
            <input
              type="text"
              value={aboutTag}
              placeholder="about"
              onChange={(e) => handleUpdate({ aboutTag: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.title_line_1', 'Título Linha 1')}
            </label>
            <input
              type="text"
              value={titleLine1}
              placeholder="Building things"
              onChange={(e) => handleUpdate({ titleLine1: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.title_line_2', 'Título Linha 2')}
            </label>
            <input
              type="text"
              value={titleLine2}
              placeholder="that matter."
              onChange={(e) => handleUpdate({ titleLine2: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.terminal_subtext', 'Subtexto Terminal')}
            </label>
            <input
              type="text"
              value={terminalText}
              placeholder="> open to collaborations"
              onChange={(e) => handleUpdate({ terminalText: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime font-jetbrains-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-eyebrow text-ash font-medium">
                {t('editor.codeweb.bg_gif_url', 'URL do GIF de Fundo')}
              </label>
              <a
                href={EXTERNAL_LINKS.GIPHY}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-signal-lime hover:underline"
              >
                <span>GIPHY</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={leftGifUrl}
              placeholder="https://media.giphy.com/.../giphy.gif"
              onChange={(e) => handleUpdate({ leftGifUrl: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>
        </div>

        <div className="space-y-3 p-3 bg-carbon/60 border border-graphite rounded-xs">
          <span className="text-eyebrow text-signal-lime font-semibold uppercase tracking-wider block">
            {t('editor.codeweb.card_top', 'Card Superior (Direita 1)')}
          </span>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-eyebrow text-ash font-medium">
                {t('editor.codeweb.lucide_icon_name', 'Nome do Ícone Lucide')}
              </label>
              <a
                href={EXTERNAL_LINKS.LUCIDE_ICONS}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-signal-lime hover:underline"
              >
                <span>{t('editor.codeweb.view_icons', 'Ver ícones (Lucide)')}</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={card1Icon}
              placeholder="Target, Crosshair, Flame, Sparkles..."
              onChange={(e) => handleUpdate({ card1Icon: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.card_text', 'Texto do Card')}
            </label>
            <input
              type="text"
              value={card1Text}
              placeholder="always learning"
              onChange={(e) => handleUpdate({ card1Text: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-eyebrow text-ash font-medium">
                {t('editor.codeweb.bg_gif_url', 'URL do GIF de Fundo')}
              </label>
              <a
                href={EXTERNAL_LINKS.GIPHY}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-signal-lime hover:underline"
              >
                <span>GIPHY</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={card1GifUrl}
              placeholder="https://media.giphy.com/.../giphy.gif"
              onChange={(e) => handleUpdate({ card1GifUrl: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>
        </div>

        <div className="space-y-3 p-3 bg-carbon/60 border border-graphite rounded-xs">
          <span className="text-eyebrow text-signal-lime font-semibold uppercase tracking-wider block">
            {t('editor.codeweb.card_bottom', 'Card Inferior (Direita 2)')}
          </span>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-eyebrow text-ash font-medium">
                {t('editor.codeweb.lucide_icon_name', 'Nome do Ícone Lucide')}
              </label>
              <a
                href={EXTERNAL_LINKS.LUCIDE_ICONS}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-signal-lime hover:underline"
              >
                <span>{t('editor.codeweb.view_icons', 'Ver ícones (Lucide)')}</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={card2Icon}
              placeholder="Star, Code, Coffee, Heart..."
              onChange={(e) => handleUpdate({ card2Icon: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash font-medium mb-1 block">
              {t('editor.codeweb.card_text', 'Texto do Card')}
            </label>
            <input
              type="text"
              value={card2Text}
              placeholder="craft matters"
              onChange={(e) => handleUpdate({ card2Text: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-eyebrow text-ash font-medium">
                {t('editor.codeweb.bg_gif_url', 'URL do GIF de Fundo')}
              </label>
              <a
                href={EXTERNAL_LINKS.GIPHY}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-signal-lime hover:underline"
              >
                <span>GIPHY</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="text"
              value={card2GifUrl}
              placeholder="https://media.giphy.com/.../giphy.gif"
              onChange={(e) => handleUpdate({ card2GifUrl: e.target.value })}
              className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-graphite">
          <span className="text-eyebrow text-ash">
            {t('editor.codeweb.static_mode', 'Static Mode (No Animation)')}
          </span>
          <Switch
            checked={staticMode}
            onChange={(checked: boolean) => handleUpdate({ staticMode: checked })}
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.CODEWEB_RETRO_GRID) {
    return (
      <CodewebBentoControls instanceId={instanceId} config={config} handleUpdate={handleUpdate} />
    )
  }

  if (widgetId === WIDGET_IDS.CODEWEB_MINIMAL_BADGE) {
    const prefix = (config.prefix as string) || ''
    const highlight = (config.highlight as string) || ''
    const suffix = (config.suffix as string) || ''
    const align = (config.align as 'center' | 'left' | 'right') || 'center'
    const showBorder = config.showBorder !== false

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Type size={14} />
          <span>{t('editor.codeweb.banner_title', 'Aura Minimalist Banner')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.prefix_text', 'Prefix Text')}
          </label>
          <input
            type="text"
            value={prefix}
            placeholder="crafted with precision by"
            onChange={(e) => handleUpdate({ prefix: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.highlight_text', 'Highlighted Text (Bold)')}
          </label>
          <input
            type="text"
            value={highlight}
            placeholder="codeweb-dev / Your Name"
            onChange={(e) => handleUpdate({ highlight: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.suffix_text', 'Suffix Text')}
          </label>
          <input
            type="text"
            value={suffix}
            placeholder="• powered by readme-aura"
            onChange={(e) => handleUpdate({ suffix: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.alignment', 'Alignment')}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => handleUpdate({ align: a })}
                className={`py-1 rounded-xs text-[11px] capitalize font-medium border transition-all cursor-pointer ${
                  align === a
                    ? 'bg-signal-lime text-black border-signal-lime font-bold'
                    : 'bg-graphite text-ash border-graphite hover:border-slate'
                }`}
              >
                {t(`editor.codeweb.align_${a}`, a)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-graphite">
          <span className="text-eyebrow text-ash">
            {t('editor.codeweb.show_outer_border', 'Show Outer Pill Border')}
          </span>
          <Switch
            checked={showBorder}
            onChange={(checked: boolean) => handleUpdate({ showBorder: checked })}
          />
        </div>
      </div>
    )
  }

  return null
}

const BENTO_PRESETS = [
  {
    label: 'Modern Fullstack',
    icon: Globe,
    items: ['TypeScript', 'Next.js', 'React', 'TailwindCSS', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    label: 'Frontend Specialist',
    icon: Layers,
    items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Figma', 'CSS3', 'HTML5'],
  },
  {
    label: 'Backend & Cloud',
    icon: Server,
    items: ['Go', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
  },
  {
    label: 'DevOps & Infra',
    icon: Cloud,
    items: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Linux', 'GitHub Actions', 'Go'],
  },
]

function CodewebBentoControls({
  instanceId: _instanceId,
  config,
  handleUpdate,
}: {
  instanceId: string
  config: Record<string, unknown>
  handleUpdate: (patch: Record<string, unknown>) => void
}) {
  const { t } = useI18n()
  const title = (config.title as string) || 'Tech Stack'
  const displayMode = (config.displayMode as 'both' | 'logo' | 'name') || 'both'
  const staticMode = Boolean(config.staticMode)
  const devCardLink = (config.devCardLink as string) || (config.link as string) || ''

  const sourceType = (config.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
  const customImageUrl = (config.imageUrl as string) || ''
  const uploadedImageData = (config.uploadedImageData as string) || ''

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [customTechInput, setCustomTechInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedTechs = Array.isArray(config.selectedTechs)
    ? (config.selectedTechs as string[])
    : Array.isArray(config.technologies)
      ? (config.technologies as string[])
      : ['TypeScript', 'React', 'Next.js', 'TailwindCSS', 'Node.js']

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        t('errors.invalid_image_type', 'Por favor, selecione um arquivo de imagem válido.')
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t('errors.image_too_large', 'A imagem deve ter no máximo 5MB.'))
      return
    }

    setErrorMsg('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        handleUpdate({
          uploadedImageData: dataUrl,
          sourceType: 'upload',
        })
      }
    }
    reader.onerror = () => {
      setErrorMsg(t('errors.image_read_error', 'Erro ao ler o arquivo de imagem.'))
    }
    reader.readAsDataURL(file)
  }

  const toggleTech = (id: string) => {
    let updated: string[]
    if (selectedTechs.includes(id)) {
      updated = selectedTechs.filter((t) => t !== id)
    } else {
      updated = [...selectedTechs, id]
    }
    handleUpdate({ selectedTechs: updated, technologies: updated })
  }

  const addCustomTech = () => {
    if (!customTechInput.trim()) return
    const updated = [...selectedTechs, customTechInput.trim()]
    handleUpdate({ selectedTechs: updated, technologies: updated })
    setCustomTechInput('')
  }

  const applyPreset = (presetItems: string[]) => {
    handleUpdate({ selectedTechs: presetItems, technologies: presetItems })
  }

  const clearAll = () => {
    handleUpdate({ selectedTechs: [], technologies: [] })
  }

  const filteredCatalog = TECH_CATALOG.filter((tech) => {
    const matchesCategory = activeCategory === 'all' || tech.category === activeCategory
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
        <LayoutGrid size={14} />
        <span>{t('editor.codeweb.bento_title', 'Aura Bento Cards Customization')}</span>
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1 font-medium">
          {t('editor.codeweb.stack_header', 'Tech Stack Header Label')}
        </label>
        <input
          type="text"
          value={title}
          placeholder="Tech Stack"
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-graphite">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <ImageIcon size={14} />
          <span>{t('editor.properties.avatar_title', 'Imagem do Avatar')}</span>
        </div>

        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.source', 'Origem da Foto')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded-xs border border-graphite">
          <button
            type="button"
            onClick={() => handleUpdate({ sourceType: 'avatar' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs text-eyebrow font-medium transition-all cursor-pointer ${
              sourceType === 'avatar'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <User size={12} />
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ sourceType: 'url' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs text-eyebrow font-medium transition-all cursor-pointer ${
              sourceType === 'url'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <ImageIcon size={12} />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs text-eyebrow font-medium transition-all cursor-pointer ${
              sourceType === 'upload'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {sourceType === 'avatar' && (
          <div className="mt-2 text-note text-ash bg-carbon/50 p-2 rounded-xs border border-graphite/50">
            {t('editor.ascii.source_avatar_help', 'Usando a foto do perfil do GitHub atual.')}
          </div>
        )}

        {sourceType === 'url' && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => {
                const normalized = normalizeUrl(e.target.value)
                handleUpdate({ imageUrl: normalized })
              }}
              placeholder="https://exemplo.com/imagem.png"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-hidden"
            />
          </div>
        )}

        {sourceType === 'upload' && uploadedImageData && (
          <div className="mt-2 text-note text-signal-lime bg-signal-lime/10 p-2 rounded-xs border border-signal-lime/20 flex items-center justify-between">
            <span>{t('editor.ascii.image_uploaded', 'Imagem carregada com sucesso!')}</span>
            <button
              onClick={() => handleUpdate({ uploadedImageData: '', sourceType: 'avatar' })}
              className="text-ash hover:text-chalk cursor-pointer"
            >
              Remover
            </button>
          </div>
        )}

        {errorMsg && <div className="mt-2 text-note text-amber-500">{errorMsg}</div>}

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-medium">
            {t('editor.codeweb.dest_link', 'Link de Destino ao Clicar (opcional)')}
          </label>
          <input
            type="text"
            value={devCardLink}
            placeholder="https://github.com/seu-usuario"
            onChange={(e) => handleUpdate({ devCardLink: e.target.value, link: e.target.value })}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-graphite">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.codeweb.badge_display_mode', 'Modo de Exibição das Badges')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded-xs border border-graphite">
          <button
            type="button"
            onClick={() => handleUpdate({ displayMode: 'both' })}
            className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
              displayMode === 'both'
                ? 'bg-graphite text-signal-lime border-signal-lime/40 font-bold'
                : 'text-ash hover:text-chalk border-transparent'
            }`}
          >
            {t('editor.codeweb.badge_name_logo', 'Nome + Logo')}
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ displayMode: 'logo' })}
            className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
              displayMode === 'logo'
                ? 'bg-graphite text-signal-lime border-signal-lime/40 font-bold'
                : 'text-ash hover:text-chalk border-transparent'
            }`}
          >
            {t('editor.codeweb.badge_logo_only', 'Apenas Logo')}
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ displayMode: 'name' })}
            className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
              displayMode === 'name'
                ? 'bg-graphite text-signal-lime border-signal-lime/40 font-bold'
                : 'text-ash hover:text-chalk border-transparent'
            }`}
          >
            {t('editor.codeweb.badge_name_only', 'Apenas Nome')}
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-graphite">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
            <Sparkles size={14} />
            <span>{t('editor.tech.title', 'Tecnologias & Skills')}</span>
          </div>
          <span className="text-caption font-jetbrains-mono text-ash bg-carbon px-1.5 py-0.5 rounded-xs border border-graphite">
            {selectedTechs.length} {t('editor.godprofile.active_count', 'selecionadas')}
          </span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-eyebrow text-ash font-medium">
              {t('editor.codeweb.active_techs', 'Tecnologias Ativas')}
            </span>
            {selectedTechs.length > 0 && (
              <button
                onClick={clearAll}
                className="text-caption text-red-400 hover:underline cursor-pointer"
              >
                {t('editor.codeweb.clear_all', 'Limpar todas')}
              </button>
            )}
          </div>

          {selectedTechs.length === 0 ? (
            <div className="p-3 text-center border border-dashed border-graphite rounded-xs text-eyebrow text-ash">
              {t(
                'editor.codeweb.no_techs_selected',
                'Nenhuma tecnologia selecionada. Escolha no catálogo abaixo.'
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-void-black border border-graphite rounded-xs">
              {selectedTechs.map((techId) => {
                const info = TECH_CATALOG.find(
                  (t) =>
                    t.id.toLowerCase() === techId.toLowerCase() ||
                    t.name.toLowerCase() === techId.toLowerCase()
                )
                const iconId = info ? info.id : techId.toLowerCase().replace(/[^a-z0-9]/g, '')
                const iconCode = iconId === 'reactnative' ? 'react' : iconId
                return (
                  <div
                    key={techId}
                    onClick={() => toggleTech(techId)}
                    className="group flex items-center gap-1 bg-graphite border border-signal-lime/40 text-signal-lime px-2 py-0.5 rounded-xs text-eyebrow font-jetbrains-mono cursor-pointer hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    <Image
                      src={`${API_ENDPOINTS.SKILL_ICONS.GET(iconCode)}&theme=dark`}
                      alt={techId}
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain"
                      unoptimized
                    />
                    <span>{info ? info.name : techId}</span>
                    <X size={10} className="opacity-60 group-hover:opacity-100" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <span className="text-eyebrow text-ash font-medium block mb-1.5">
            {t('editor.codeweb.quick_presets', 'Presets Rápidos')}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {BENTO_PRESETS.map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.items)}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-carbon border border-graphite hover:border-signal-lime/50 rounded-xs text-eyebrow text-chalk hover:text-signal-lime transition-colors cursor-pointer"
                >
                  <Icon size={12} className="text-signal-lime shrink-0" />
                  <span className="truncate">{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: t('editor.codeweb.cat_all', 'Todos') },
              { id: 'languages', label: t('editor.codeweb.cat_languages', 'Linguagens') },
              { id: 'frontend', label: t('editor.codeweb.cat_frontend', 'Frontend') },
              { id: 'backend', label: t('editor.codeweb.cat_backend', 'Backend') },
              { id: 'devops', label: t('editor.codeweb.cat_devops', 'DevOps') },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-0.5 rounded-xs text-caption font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-signal-lime text-black font-semibold'
                  : 'bg-graphite text-ash hover:text-chalk'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('editor.codeweb.search_tech', 'Buscar tecnologia...')}
            className="w-full bg-graphite border border-graphite rounded-xs pl-7 pr-2.5 py-1 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
        </div>

        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto p-1 bg-void-black border border-graphite rounded-xs">
          {filteredCatalog.map((tech) => {
            const isSelected = selectedTechs.some(
              (t) =>
                t.toLowerCase() === tech.id.toLowerCase() ||
                t.toLowerCase() === tech.name.toLowerCase()
            )
            const iconCode = tech.id === 'reactnative' ? 'react' : tech.id
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => toggleTech(tech.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-xs text-eyebrow text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-signal-lime/15 border border-signal-lime/50 text-signal-lime'
                    : 'bg-graphite/60 border border-graphite hover:border-slate text-chalk hover:bg-graphite'
                }`}
              >
                <Image
                  src={`${API_ENDPOINTS.SKILL_ICONS.GET(iconCode)}&theme=dark`}
                  alt={tech.name}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 object-contain shrink-0"
                  unoptimized
                />
                <span className="truncate flex-1">{tech.name}</span>
                {isSelected && <Check size={10} className="text-signal-lime shrink-0" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customTechInput}
            placeholder={t('editor.codeweb.custom_tech_placeholder', 'Tecnologia personalizada...')}
            onChange={(e) => setCustomTechInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTech()}
            className="w-full bg-graphite border border-graphite rounded-xs px-2.5 py-1.5 text-note text-chalk focus:outline-hidden focus:border-signal-lime"
          />
          <button
            type="button"
            onClick={addCustomTech}
            className="p-1.5 bg-signal-lime text-black rounded-xs hover:bg-signal-lime/80 transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-graphite">
        <span className="text-eyebrow text-ash">
          {t('editor.codeweb.static_mode', 'Static Mode (No Animation)')}
        </span>
        <Switch
          checked={staticMode}
          onChange={(checked: boolean) => handleUpdate({ staticMode: checked })}
        />
      </div>
    </div>
  )
}
