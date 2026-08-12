'use client'

import {
  AlertCircle,
  Image as ImageIcon,
  Library,
  Link as LinkIcon,
  Type,
  Upload,
} from 'lucide-react'
import React, { useRef, useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import type { WidgetConfig } from '@/engine/types'
import { useI18n } from '@/i18n'
import { normalizeUrl } from '@/utils/url'

import { useEditorStore } from '../../store/editorStore'

interface CustomImageControlsProps {
  instanceId: string
  config: WidgetConfig
}

export function CustomImageControls({ instanceId, config }: CustomImageControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((s) => s.updateWidgetConfig)
  const updateWidgetSize = useEditorStore((s) => s.updateWidgetSize)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleImageSelect = (url: string) => {
    setErrorMsg(null)
    updateWidgetConfig(instanceId, {
      imageUrl: url,
      src: url,
      url: url,
    })

    const img = new window.Image()
    img.onload = () => {
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      if (w > 0 && h > 0) {
        if (w > 800) {
          const ratio = 800 / w
          w = 800
          h = Math.round(h * ratio)
        }
        updateWidgetSize(instanceId, { width: w, height: h })
      }
    }
    img.src = url
  }

  const currentUrl =
    (config.imageUrl as string) || (config.src as string) || (config.url as string) || ''
  const currentTargetUrl = (config.targetUrl as string) || (config.href as string) || ''
  const showTitle = Boolean(config.showTitle)
  const customTitle = (config.customTitle as string) || '[ IMAGE ]'
  const mode = (config.mode as 'contain' | 'badge') || 'contain'
  const sourceType = (config.sourceType as 'suggestions' | 'url' | 'upload') || 'suggestions'

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        t(
          'editor.custom_image.error_invalid_type',
          'Por favor, selecione um arquivo de imagem válido.'
        )
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t('editor.custom_image.error_too_large', 'A imagem deve ter no máximo 5MB.'))
      return
    }

    setErrorMsg(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        handleImageSelect(dataUrl)
      }
    }
    reader.onerror = () => {
      setErrorMsg(t('editor.custom_image.error_reading', 'Erro ao ler o arquivo de imagem.'))
    }
    reader.readAsDataURL(file)
  }

  const SUGGESTED_GIFS = [
    {
      name: 'Designer',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Designer.gif',
    },
    {
      name: 'Developer',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Developer.gif',
    },
    {
      name: 'Earth',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Earth.gif',
    },
    {
      name: 'Handshake',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Handshake.gif',
    },
    {
      name: 'Hi',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Hi.gif',
    },
    {
      name: 'Mario Gameplay',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Mario_Gameplay.gif',
    },
    {
      name: 'Mario Hello',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Mario_Hello_Big.gif',
    },
    {
      name: 'Medal',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Medal.gif',
    },
    {
      name: 'PC',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/PC.gif',
    },
    {
      name: 'Point Down',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Point_Down.gif',
    },
    {
      name: 'Rocket',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Rocket.gif',
    },
    {
      name: 'Super Mario',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Super_Mario.gif',
    },
    {
      name: 'Coin',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/coin.gif',
    },
    {
      name: 'Dino',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/dino.gif',
    },
    {
      name: 'Gandalf',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/gandalf_parrot.gif',
    },
    {
      name: 'Happy',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/happy.gif',
    },
    {
      name: 'Headbang',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/headbang.gif',
    },
    {
      name: 'Hmm',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/hmm.gif',
    },
    {
      name: 'Powerup',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/powerup.gif',
    },
    {
      name: 'Wave',
      url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/wave.gif',
    },
  ]

  return (
    <div className="space-y-4 pt-3 border-t border-graphite">
      <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <ImageIcon size={14} />
        <span>{t('editor.custom_image.title', 'Configurações de Imagem')}</span>
      </div>

      <div className="space-y-2">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.source', 'Origem da Foto')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded border border-graphite">
          <button
            type="button"
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'suggestions' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${
              sourceType === 'suggestions'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <Library size={12} />
            <span>Sugestões</span>
          </button>
          <button
            type="button"
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'url' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${
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
            onClick={() => {
              updateWidgetConfig(instanceId, { sourceType: 'upload' })
              if (sourceType === 'upload') {
                fileInputRef.current?.click()
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${
              sourceType === 'upload'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
        </div>

        {sourceType === 'url' && (
          <div className="mt-2">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => {
                const normalized = normalizeUrl(e.target.value)
                handleImageSelect(normalized)
              }}
              data-testid="custom-image-url-input"
              placeholder="https://exemplo.com/imagem.png"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>
        )}

        {sourceType === 'suggestions' && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTED_GIFS.map((gif) => (
              <button
                key={gif.name}
                type="button"
                onClick={() => {
                  handleImageSelect(gif.url)
                }}
                className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors border ${
                  currentUrl === gif.url
                    ? 'bg-graphite border-signal-lime text-signal-lime'
                    : 'bg-carbon border-graphite hover:border-signal-lime/60 text-ash hover:text-signal-lime hover:bg-graphite/40'
                }`}
              >
                {gif.name}
              </button>
            ))}
          </div>
        )}

        {sourceType === 'upload' && (
          <div className="mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-graphite hover:border-signal-lime/60 bg-carbon hover:bg-graphite/40 text-chalk text-eyebrow py-2 px-3 rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload size={13} className="text-signal-lime" />
              <span>
                {currentUrl.startsWith('data:')
                  ? t('editor.custom_image.change_file', 'Trocar Arquivo de Imagem Local')
                  : t(
                      'editor.custom_image.upload_file',
                      'Fazer Upload de Imagem Local (PNG, JPG, SVG, GIF)'
                    )}
              </span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-1.5 text-caption text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-900/50 mt-2">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-graphite/60">
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight flex items-center gap-1.5">
          <LinkIcon size={12} className="text-signal-lime" />
          <span>{t('editor.custom_image.target_url_label', 'Link de Destino (Clicável)')}</span>
        </label>
        <input
          type="text"
          value={currentTargetUrl}
          onChange={(e) =>
            updateWidgetConfig(instanceId, { targetUrl: e.target.value, href: e.target.value })
          }
          placeholder="Ex: https://meusite.com ou https://github.com/usuario"
          className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
        />
      </div>

      <div className="pt-2 border-t border-graphite/60 space-y-3">
        <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
          <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
            {t('editor.custom_image.show_title', 'Exibir Título do Widget')}
          </label>
          <Switch
            checked={showTitle}
            onChange={(checkedValue) => updateWidgetConfig(instanceId, { showTitle: checkedValue })}
          />
        </div>

        {showTitle && (
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight flex items-center gap-1.5">
              <Type size={12} />
              <span>{t('editor.custom_image.title_label', 'Título Customizado')}</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => updateWidgetConfig(instanceId, { customTitle: e.target.value })}
              placeholder="Ex: [ MINHA IMAGEM ]"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
            {t('editor.custom_image.mode_label', 'Modo de Redimensionamento')}
          </label>
          <select
            value={mode}
            onChange={(e) => updateWidgetConfig(instanceId, { mode: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          >
            <option value="contain">Ajustar ao Container (Contain)</option>
            <option value="badge">Estilo Badge (Altura fixa 32px)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
