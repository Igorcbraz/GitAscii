import { Image, Upload, User } from 'lucide-react'
import React, { useRef, useState } from 'react'

import type { WidgetConfig } from '@/engine/types'
import { useI18n } from '@/i18n'
import { normalizeUrl } from '@/utils/url'

import { useEditorStore } from '../../store/editorStore'

interface AvatarControlsProps {
  instanceId: string
  config: WidgetConfig
}

export function AvatarControls({ instanceId, config }: AvatarControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((s) => s.updateWidgetConfig)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sourceType = (config.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
  const customImageUrl = (config.imageUrl as string) || ''
  const uploadedImageData = (config.uploadedImageData as string) || ''

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        t('editor.avatar.error_invalid_image', 'Por favor selecione um arquivo de imagem válido.')
      )
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target?.result as string
      if (base64Data) {
        updateWidgetConfig(instanceId, {
          sourceType: 'upload',
          uploadedImageData: base64Data,
        })
        setErrorMsg(null)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
        <Image size={14} />
        <span>{t('editor.properties.avatar_title', 'Imagem do Avatar')}</span>
      </div>

      <div className="space-y-2">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.source', 'Origem da Foto')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded border border-graphite">
          <button
            type="button"
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'avatar' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${
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
            onClick={() => updateWidgetConfig(instanceId, { sourceType: 'url' })}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-eyebrow font-medium transition-all ${
              sourceType === 'url'
                ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                : 'text-ash hover:text-chalk'
            }`}
          >
            <Image size={12} />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {sourceType === 'avatar' && (
          <div className="mt-2 text-note text-ash bg-carbon/50 p-2 rounded border border-graphite/50">
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
                updateWidgetConfig(instanceId, { imageUrl: normalized })
              }}
              placeholder="https://exemplo.com/imagem.png"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>
        )}

        {sourceType === 'upload' && uploadedImageData && (
          <div className="mt-2 text-note text-signal-lime bg-signal-lime/10 p-2 rounded border border-signal-lime/20 flex items-center justify-between">
            <span>{t('editor.ascii.image_uploaded', 'Imagem carregada com sucesso!')}</span>
            <button
              onClick={() => updateWidgetConfig(instanceId, { uploadedImageData: '' })}
              className="text-ash hover:text-chalk"
            >
              Remover
            </button>
          </div>
        )}

        {errorMsg && <div className="mt-2 text-note text-amber-500">{errorMsg}</div>}
      </div>
    </div>
  )
}
