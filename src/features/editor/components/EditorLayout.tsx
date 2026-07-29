'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { EditorToolbar } from './Toolbar/EditorToolbar';
import { WidgetLibrary } from './Sidebar/WidgetLibrary';
import { SVGCanvas } from './Canvas/SVGCanvas';
import { PropertiesPanel } from './Properties/PropertiesPanel';
import { createConfiguration } from '@/engine/core/TemplateRenderer';
import { generateBestProfile } from '@/engine/generate/profileAnalyzer';
import type { SavedConfiguration, NormalizedGitHubData } from '@/engine/types';
import { useI18n } from '@/i18n';

interface EditorLayoutProps {
  username: string;
  profileSlug?: string;
  autoGenerate?: boolean;
}

export function EditorLayout({ username, profileSlug = 'default', autoGenerate = false }: EditorLayoutProps) {
  const { initEditor, config } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/github/${username}`);
        if (!res.ok) {
          let errMsg = 'Failed to fetch GitHub profile';
          try {
            const errJson = await res.json();
            errMsg = errJson.error || errMsg;
          } catch {
            errMsg = await res.text() || errMsg;
          }
          throw new Error(errMsg);
        }
        const data: NormalizedGitHubData = await res.json();

        let initialConfig: SavedConfiguration;

        const storageKey = `gitascii_${data.user.id}_${profileSlug}`;
        const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

        if (savedDraft) {
          try {
            initialConfig = JSON.parse(savedDraft);
          } catch {
            initialConfig = autoGenerate
              ? generateBestProfile(data)
              : createConfiguration(data.user.id, data.user.login, 'terminal', profileSlug);
          }
        } else if (autoGenerate) {
          initialConfig = generateBestProfile(data);
        } else {
          initialConfig = createConfiguration(
            data.user.id,
            data.user.login,
            'terminal',
            profileSlug,
            profileSlug === 'default' ? 'Default' : profileSlug.toUpperCase()
          );
        }

        if (isMounted) {
          initEditor(initialConfig, data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [username, profileSlug, autoGenerate, initEditor]);

  const { t } = useI18n();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight">
        <div className="w-8 h-8 border-2 border-signal-lime border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-label uppercase tracking-[0.2em] text-ash">{t('editor.fetching_data', '[ FETCHING GITHUB DATA ]')}</span>
        <span className="text-body text-chalk font-medium mt-1">@{username}</span>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight">
        <span className="text-label uppercase tracking-[0.2em] text-red-400 mb-2">{t('editor.error_fetching', '[ ERROR ]')}</span>
        <h2 className="text-subheading font-pt-serif font-light text-chalk mb-4">{error}</h2>
        <a href="/" className="px-4 py-2 bg-signal-lime text-black font-medium text-label rounded-sm glow-lime">
          {t('editor.return_home', 'Return to Home')}
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-carbon">
      <EditorToolbar />
      <div className="flex-1 flex overflow-hidden relative">
        <WidgetLibrary />
        <SVGCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
