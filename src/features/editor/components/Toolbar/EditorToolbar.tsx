'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Copy,
  Check
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export function EditorToolbar() {
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
  } = useEditorStore();

  const [copied, setCopied] = useState(false);

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
      ? `https://gitascii.com/api/${username}`
      : `https://gitascii.com/api/${username}/${profileSlug}`;

  const embedCode = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${embedUrl}?theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="${embedUrl}?theme=light" />
  <img alt="${username}'s GitAscii Profile" src="${embedUrl}" />
</picture>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-30">
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

      <div className="flex items-center gap-1 bg-onyx border border-graphite rounded-sm p-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-4 w-px bg-graphite mx-1" />

        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          title="Zoom Out"
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>

        <span className="font-jetbrains-mono text-eyebrow text-ash px-2">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          title="Zoom In"
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 bg-signal-lime text-black px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider glow-lime hover:brightness-110 transition-all cursor-pointer"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
    </header>
  );
}
