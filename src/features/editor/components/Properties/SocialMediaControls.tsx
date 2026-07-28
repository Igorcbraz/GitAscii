'use client';

import React, { useState } from 'react';
import { Share2, Check, X, ChevronDown } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export interface SocialPlatform {
  id: string;
  label: string;
  logo: string;
  color: string;
  defaultUrl: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'github', label: 'GitHub', logo: 'github', color: '181717', defaultUrl: 'https://github.com/{username}' },
  { id: 'linkedin', label: 'LinkedIn', logo: 'linkedin', color: '0A66C2', defaultUrl: 'https://linkedin.com/in/{username}' },
  { id: 'twitter', label: 'X (Twitter)', logo: 'x', color: '000000', defaultUrl: 'https://x.com/{username}' },
  { id: 'discord', label: 'Discord', logo: 'discord', color: '5865F2', defaultUrl: 'https://discord.gg/yourserver' },
  { id: 'youtube', label: 'YouTube', logo: 'youtube', color: 'FF0000', defaultUrl: 'https://youtube.com/@{username}' },
  { id: 'instagram', label: 'Instagram', logo: 'instagram', color: 'E4405F', defaultUrl: 'https://instagram.com/{username}' },
  { id: 'twitch', label: 'Twitch', logo: 'twitch', color: '9146FF', defaultUrl: 'https://twitch.tv/{username}' },
  { id: 'devto', label: 'Dev.to', logo: 'devto', color: '0A0A0A', defaultUrl: 'https://dev.to/{username}' },
  { id: 'medium', label: 'Medium', logo: 'medium', color: '000000', defaultUrl: 'https://medium.com/@{username}' },
  { id: 'email', label: 'Email', logo: 'gmail', color: 'EA4335', defaultUrl: 'mailto:user@example.com' },
  { id: 'website', label: 'Portfolio', logo: 'googlechrome', color: '2563EB', defaultUrl: 'https://{username}.dev' },
  { id: 'stackoverflow', label: 'StackOverflow', logo: 'stackoverflow', color: 'F48024', defaultUrl: 'https://stackoverflow.com/users/{username}' },
  { id: 'bluesky', label: 'Bluesky', logo: 'bluesky', color: '1185FE', defaultUrl: 'https://bsky.app/profile/{username}' },
  { id: 'mastodon', label: 'Mastodon', logo: 'mastodon', color: '6364FF', defaultUrl: 'https://mastodon.social/@{username}' },
  { id: 'reddit', label: 'Reddit', logo: 'reddit', color: 'FF4500', defaultUrl: 'https://reddit.com/user/{username}' },
  { id: 'spotify', label: 'Spotify', logo: 'spotify', color: '1DB954', defaultUrl: 'https://open.spotify.com/user/{username}' },
  { id: 'telegram', label: 'Telegram', logo: 'telegram', color: '26A5E4', defaultUrl: 'https://t.me/{username}' },
  { id: 'tiktok', label: 'TikTok', logo: 'tiktok', color: '000000', defaultUrl: 'https://tiktok.com/@{username}' },
  { id: 'steam', label: 'Steam', logo: 'steam', color: '000000', defaultUrl: 'https://steamcommunity.com/id/{username}' },
  { id: 'hashnode', label: 'Hashnode', logo: 'hashnode', color: '2962FF', defaultUrl: 'https://hashnode.com/@{username}' },
];

const BADGE_STYLES = [
  { id: 'for-the-badge', name: 'SHIELDS BOLD', preview: 'for-the-badge', info: 'Caixa alta preenchida' },
  { id: 'flat-square', name: 'SHIELDS FLAT', preview: 'flat-square', info: 'Badge retangular clean' },
  { id: 'social', name: 'SHIELDS SOCIAL', preview: 'social', info: 'Estilo contador social' },
  { id: 'skillicons', name: 'SKILL ICONS', preview: 'skillicons', info: 'Ícones circulares minimalistas' },
];

interface SocialMediaControlsProps {
  instanceId: string;
  config: Record<string, unknown>;
}

export function SocialMediaControls({ instanceId, config }: SocialMediaControlsProps) {
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig);
  const githubData = useEditorStore((state) => state.githubData);
  const username = githubData?.user.login || 'user';

  const [isBadgeMenuOpen, setIsBadgeMenuOpen] = useState(false);

  const selectedSocials = Array.isArray(config.selectedSocials)
    ? (config.selectedSocials as string[])
    : ['github', 'linkedin', 'twitter', 'discord', 'youtube', 'website'];

  const socialUrls = (config.socialUrls as Record<string, string>) || {};
  const badgeStyle = (config.badgeStyle as string) || 'for-the-badge';
  const showTitle = config.showTitle !== false;
  const customTitle = (config.customTitle as string) || '[ SOCIAL MEDIA ]';

  const selectedBadgeStyleObj = BADGE_STYLES.find((b) => b.id === badgeStyle) || BADGE_STYLES[0];

  const toggleSocial = (id: string) => {
    let updated: string[];
    if (selectedSocials.includes(id)) {
      updated = selectedSocials.filter((s) => s !== id);
    } else {
      updated = [...selectedSocials, id];
    }
    updateWidgetConfig(instanceId, { selectedSocials: updated });
  };

  const updateUrl = (id: string, url: string) => {
    const updatedUrls = { ...socialUrls, [id]: url };
    updateWidgetConfig(instanceId, { socialUrls: updatedUrls });
  };

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Share2 size={14} />
          <span>Redes Sociais & Badges</span>
        </div>
        <span className="text-caption font-jetbrains-mono text-ash bg-carbon px-1.5 py-0.5 rounded-sm border border-graphite">
          {selectedSocials.length} redes
        </span>
      </div>

      {/* Title Customization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-ash font-medium">Exibir Título</label>
          <input
            type="checkbox"
            checked={showTitle}
            onChange={(e) => updateWidgetConfig(instanceId, { showTitle: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
          />
        </div>

        {showTitle && (
          <input
            type="text"
            value={customTitle}
            onChange={(e) => updateWidgetConfig(instanceId, { customTitle: e.target.value })}
            placeholder="Ex: [ SOCIAL MEDIA ]"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
        )}
      </div>

      {/* Visual Badge Style Selector (Matching AsciiArtControls charset selector) */}
      <div className="space-y-2 pt-1 relative">
        <label className="text-eyebrow text-ash font-medium block">
          Estilo das Badges (Base)
        </label>

        {/* Custom Visual Select Trigger */}
        <button
          type="button"
          onClick={() => setIsBadgeMenuOpen(!isBadgeMenuOpen)}
          className="w-full bg-graphite border border-graphite hover:border-signal-lime/50 p-2.5 rounded-xs text-left flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="font-jetbrains-mono bg-carbon text-signal-lime text-caption px-2 py-0.5 rounded-sm border border-graphite font-bold shrink-0">
              {selectedBadgeStyleObj.preview}
            </span>
            <div className="truncate">
              <div className="text-eyebrow text-chalk font-semibold leading-tight">{selectedBadgeStyleObj.name}</div>
              <div className="text-[9px] text-ash">{selectedBadgeStyleObj.info}</div>
            </div>
          </div>
          <ChevronDown size={14} className={`text-ash transition-transform shrink-0 ${isBadgeMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Options List */}
        {isBadgeMenuOpen && (
          <div className="absolute z-50 left-0 right-0 top-15 bg-carbon border border-graphite rounded-xs shadow-xl max-h-55 overflow-y-auto p-1 space-y-1">
            {BADGE_STYLES.map((item) => {
              const isSelected = item.id === badgeStyle;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updateWidgetConfig(instanceId, { badgeStyle: item.id });
                    setIsBadgeMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xs flex items-center justify-between transition-all cursor-pointer ${isSelected
                      ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                      : 'hover:bg-graphite/60 text-chalk'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-jetbrains-mono bg-void-black text-signal-lime text-caption px-2 py-0.5 rounded-sm border border-graphite font-semibold shrink-0">
                      {item.preview}
                    </span>
                    <span className="text-eyebrow font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-ash shrink-0">{item.info}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Social Platforms Picker Grid */}
      <div className="space-y-2 pt-1">
        <label className="text-eyebrow text-chalk font-medium block">
          Selecione as Redes Sociais
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-45 overflow-y-auto p-1 bg-void-black border border-graphite rounded-xs">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isSelected = selectedSocials.includes(platform.id);
            const badgePreviewUrl = `https://img.shields.io/badge/${encodeURIComponent(platform.label)}-${platform.color}?style=flat-square&logo=${platform.logo}&logoColor=white`;

            return (
              <div
                key={platform.id}
                onClick={() => toggleSocial(platform.id)}
                className={`p-2 rounded-xs border flex items-center justify-between cursor-pointer transition-all duration-150 ${isSelected
                    ? 'border-signal-lime bg-signal-lime/10 text-signal-lime'
                    : 'border-graphite bg-onyx text-ash hover:border-slate hover:text-chalk'
                  }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <img src={badgePreviewUrl} alt={platform.label} className="h-4 object-contain" />
                </div>
                <div
                  className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ${isSelected ? 'bg-signal-lime border-signal-lime text-black' : 'border-graphite bg-carbon'
                    }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* URL Customization for Selected Socials */}
      {selectedSocials.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-graphite">
          <label className="text-eyebrow text-chalk font-medium block">
            Personalizar URLs / Links de Destino
          </label>
          <div className="space-y-2 max-h-55 overflow-y-auto pr-1">
            {selectedSocials.map((platformId) => {
              const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
              if (!platform) return null;

              const currentUrl = socialUrls[platformId] !== undefined
                ? socialUrls[platformId]
                : platform.defaultUrl.replace('{username}', username);

              return (
                <div key={platformId} className="bg-graphite/40 border border-graphite p-2 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-eyebrow font-medium text-chalk flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${platform.color}` }} />
                      {platform.label}
                    </span>
                    <button
                      onClick={() => toggleSocial(platformId)}
                      className="text-ash hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                      title="Remover"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => updateUrl(platformId, e.target.value)}
                      placeholder={platform.defaultUrl.replace('{username}', username)}
                      className="flex-1 bg-void-black border border-graphite text-chalk font-jetbrains-mono text-eyebrow px-2 py-1 rounded-xs focus:border-signal-lime focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
