'use client'

import {
  BarChart3,
  Check,
  Code2,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  GripVertical,
  Heading,
  Layers as LayersIcon,
  LayoutTemplate,
  Lock,
  Minus,
  Terminal,
  Trash2,
  Unlock,
  User,
} from 'lucide-react'
import React, { useState } from 'react'

import type { WidgetInstance } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

const ICON_MAP: Record<string, React.ElementType> = {
  header: Heading,
  avatar: User,
  'ascii-art': Terminal,
  'terminal-info': Terminal,
  'terminal-card': Terminal,
  bio: FileText,
  stats: BarChart3,
  languages: Code2,
  repositories: FolderGit2,
  divider: Minus,
  footer: LayoutTemplate,
}

export function LayersPanel() {
  const { t } = useI18n()
  const widgets = useEditorStore((state) => state.config?.widgets)
  const selectedInstanceId = useEditorStore((state) => state.selectedInstanceId)
  const selectWidget = useEditorStore((state) => state.selectWidget)
  const toggleWidgetVisibility = useEditorStore((state) => state.toggleWidgetVisibility)
  const toggleWidgetLock = useEditorStore((state) => state.toggleWidgetLock)
  const removeWidget = useEditorStore((state) => state.removeWidget)
  const renameWidget = useEditorStore((state) => state.renameWidget)
  const reorderWidgets = useEditorStore((state) => state.reorderWidgets)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  if (!widgets) return null

  const widgetsDisplayOrder = [...widgets].reverse()

  const handleStartRename = (widget: WidgetInstance) => {
    setEditingId(widget.instanceId)
    setEditingName(widget.name || `${widget.widgetId.toUpperCase()} Layer`)
  }

  const handleSaveRename = (instanceId: string) => {
    if (editingName.trim()) {
      renameWidget(instanceId, editingName.trim())
    }
    setEditingId(null)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const total = widgets.length
    const actualFrom = total - 1 - draggedIndex
    const actualTo = total - 1 - targetIndex

    reorderWidgets(actualFrom, actualTo)
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="label-stamp">
          {t('editor.canvas.layers_panel_title', '[ CAMADAS / LAYERS ]')}
        </div>
        <span className="text-eyebrow font-jetbrains-mono text-ash">
          {t('editor.canvas.layers_count', '{count} items', {
            count: String(widgets.length),
          })}
        </span>
      </div>

      <p className="text-note text-ash font-inter-tight mb-3">
        {t(
          'editor.canvas.layers_reorder_desc',
          'Arraste para reordenar a sobreposição das camadas igual no Photoshop.'
        )}
      </p>

      {widgets.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-graphite rounded-sm text-ash text-note">
          {t('editor.canvas.no_layers', 'Nenhuma camada. Adicione widgets da biblioteca.')}
        </div>
      ) : (
        <div className="space-y-1.5">
          {widgetsDisplayOrder.map((widget, displayIndex) => {
            const isSelected = widget.instanceId === selectedInstanceId
            const Icon = ICON_MAP[widget.widgetId] || LayersIcon
            const isEditing = editingId === widget.instanceId
            const displayName =
              widget.name || `${widget.widgetId.charAt(0).toUpperCase() + widget.widgetId.slice(1)}`

            return (
              <div
                key={widget.instanceId}
                draggable
                onDragStart={(e) => handleDragStart(e, displayIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, displayIndex)}
                onClick={() => selectWidget(widget.instanceId)}
                className={`group flex items-center justify-between p-2.5 rounded-xs border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-iron border-signal-lime text-chalk shadow-sm'
                    : 'bg-graphite border-graphite text-ash hover:border-slate hover:text-chalk'
                } ${!widget.visible ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="cursor-grab text-ash/40 group-hover:text-ash">
                    <GripVertical size={14} />
                  </div>

                  <div
                    className={`p-1.5 rounded-xs ${
                      isSelected ? 'bg-signal-lime text-black' : 'bg-void-black text-signal-lime'
                    }`}
                  >
                    <Icon size={14} />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(widget.instanceId)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                          className="w-full bg-void-black text-chalk border border-signal-lime px-1.5 py-0.5 text-note font-inter-tight rounded-xs focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveRename(widget.instanceId)
                          }}
                          className="text-signal-lime p-1 hover:bg-graphite rounded"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-inter-tight font-medium text-note truncate">
                          {displayName}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartRename(widget)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-ash hover:text-chalk transition-opacity p-0.5"
                          title={t('editor.canvas.rename_layer', 'Renomear camada')}
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleWidgetVisibility(widget.instanceId)}
                    title={
                      widget.visible
                        ? t('editor.canvas.hide_layer', 'Ocultar camada')
                        : t('editor.canvas.show_layer', 'Exibir camada')
                    }
                    className={`p-1 rounded hover:bg-void-black transition-colors ${
                      widget.visible ? 'text-ash hover:text-chalk' : 'text-amber-400'
                    }`}
                  >
                    {widget.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    onClick={() => toggleWidgetLock(widget.instanceId)}
                    title={
                      widget.locked
                        ? t('editor.canvas.unlock_layer', 'Desbloquear camada')
                        : t('editor.canvas.lock_layer', 'Bloquear camada')
                    }
                    className={`p-1 rounded hover:bg-void-black transition-colors ${
                      widget.locked ? 'text-signal-lime' : 'text-ash hover:text-chalk'
                    }`}
                  >
                    {widget.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>

                  <button
                    onClick={() => removeWidget(widget.instanceId)}
                    title={t('editor.canvas.delete_layer', 'Excluir camada')}
                    className="p-1 rounded hover:bg-red-500/20 text-ash hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
