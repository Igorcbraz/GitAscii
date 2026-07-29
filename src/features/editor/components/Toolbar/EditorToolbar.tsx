'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Save,
  Loader2,
  Download,
  Upload
} from 'lucide-react';
import { CopyGuideModal } from './CopyGuideModal';
import { useEditorStore } from '../../store/editorStore';
import { APP_URL } from '../../../../constants';
import { useI18n } from '@/i18n';

export function EditorToolbar() {
  const { t } = useI18n();
  const {
    config,
    githubData,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    saveToServer,
    isSaving,
    importLayout,
  } = useEditorStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [currentOrigin, setCurrentOrigin] = useState(APP_URL);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveToServer();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus((prev) => prev === 'error' ? 'idle' : prev), 3000);
    }
  };

  const handleExport = () => {
    if (!config) return;
    try {
      const exportData = {
        widgets: config.widgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gitascii_layout_${config.username}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export layout:', err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;

        const data = JSON.parse(result);
        if (!data || !Array.isArray(data.widgets)) {
          alert(t('editor.sidebar.import.invalid_format', 'Formato de arquivo inválido: lista de widgets não encontrada.'));
          return;
        }

        // Import widgets and optionally global styles & templateId
        importLayout(data.widgets, data.globalStyles, data.templateId);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Failed to parse import file:', err);
        alert(t('editor.sidebar.import.invalid_json', 'Falha ao processar arquivo JSON. Verifique se é um arquivo JSON válido.'));
      }
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        if (selectedInstanceId) {
          e.preventDefault();
          duplicateWidget(selectedInstanceId);
        }
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedInstanceId) {
        const widget = config?.widgets.find((w) => w.instanceId === selectedInstanceId);
        if (widget && !widget.locked) {
          e.preventDefault();
          removeWidget(selectedInstanceId);
        }
        return;
      }

      if (e.key === 'Escape' && selectedInstanceId) {
        e.preventDefault();
        selectWidget(null);
        return;
      }

      if (selectedInstanceId && config) {
        const widget = config.widgets.find((w) => w.instanceId === selectedInstanceId);
        if (widget && !widget.locked) {
          const step = e.shiftKey ? 10 : 2;

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: widget.position.x, y: Math.max(0, widget.position.y - step) }, true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: widget.position.x, y: widget.position.y + step }, true);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: Math.max(0, widget.position.x - step), y: widget.position.y }, true);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: Math.min(800 - widget.size.width, widget.position.x + step), y: widget.position.y }, true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    config,
  ]);

  if (!config || !githubData) return null;

  const username = config.username;
  const profileSlug = config.profileSlug;

  const embedUrl =
    profileSlug === 'default'
      ? `${currentOrigin}/api/${username}`
      : `${currentOrigin}/api/${username}/${profileSlug}`;



  const embedCode = `![Widget](${embedUrl})`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    
    const skipGuide = typeof window !== 'undefined' && localStorage.getItem('gitascii_skip_copy_guide') === 'true';
    if (!skipGuide) {
      setShowGuide(true);
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-inter-tight text-[16px] font-medium text-chalk">Git</span>
          <span className="font-pt-serif text-[16px] font-light italic text-signal-lime">Ascii</span>
        </Link>

        <div className="h-4 w-px bg-graphite" />

        <div className="flex items-center gap-2 text-ash text-label font-inter-tight">
          <span className="text-chalk font-medium">@{username}</span>
          <span>/</span>
          <span className="text-signal-lime uppercase tracking-wider font-medium text-eyebrow px-2 py-0.5 border border-graphite rounded-xs bg-onyx">
            {config.profileName || 'Default'}
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-onyx border border-graphite rounded-sm p-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title={t('editor.toolbar.undo', 'Undo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title={t('editor.toolbar.redo', 'Redo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-4 w-px bg-graphite mx-1" />

        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          title={t('editor.toolbar.zoom_out', 'Zoom Out')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>

        <span className="font-jetbrains-mono text-eyebrow text-ash px-2">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          title={t('editor.toolbar.zoom_in', 'Zoom In')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer ${
            saveStatus === 'saved'
              ? 'bg-signal-lime text-black glow-lime'
              : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-onyx text-chalk border border-graphite hover:bg-graphite hover:text-white'
          }`}
        >
          {saveStatus === 'saving' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>
            {saveStatus === 'saving'
              ? t('common.saving', 'Saving...')
              : saveStatus === 'saved'
              ? t('common.saved', 'Saved!')
              : saveStatus === 'error'
              ? t('common.error', 'Error!')
              : t('common.save_profile', 'Save Profile')}
          </span>
        </button>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 bg-signal-lime text-black px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider glow-lime hover:brightness-110 transition-all cursor-pointer"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? t('common.copied', 'Copied!') : t('common.copy_code', 'Copy Code')}</span>
        </button>
      </div>

      <CopyGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        username={username}
        embedCode={embedCode}
      />
    </header>
  );
}
