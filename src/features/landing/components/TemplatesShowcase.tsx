'use client';

import React from 'react';
import { useI18n } from '@/i18n';

const templates = [
  { name: 'Terminal', gradient: 'from-[#000000] to-[#1a1a2e]', accent: '#c5ff4a', tags: ['Classic', 'CLI'], preview: 'root@host:~$ ./run\n[OK] System Ready\n> Executing ASCII...' },
  { name: 'Minimal', gradient: 'from-[#ffffff] to-[#f5f5f5]', accent: '#000000', tags: ['Clean', 'Light'], preview: '      .       \n    .   .     \n  .       .   ' },
  { name: 'GitHub Dark', gradient: 'from-[#0d1117] to-[#161b22]', accent: '#58a6ff', tags: ['Native', 'Dark'], preview: 'const profile = {\n  commits: 492,\n  stars: 128\n};' },
  { name: 'Dracula', gradient: 'from-[#282a36] to-[#44475a]', accent: '#bd93f9', tags: ['Theme', 'Vibrant'], preview: 'function magic() {\n  return "sparkles";\n}' },
  { name: 'Nord', gradient: 'from-[#2e3440] to-[#3b4252]', accent: '#88c0d0', tags: ['Cold', 'Elegant'], preview: '# ~ / nordic / cold\n\n[===        ] 30%' },
  { name: 'Tokyo Night', gradient: 'from-[#1a1b26] to-[#24283b]', accent: '#7aa2f7', tags: ['Neon', 'Modern'], preview: 'import neon from "night";\n\nneon.glow();' },
  { name: 'Gruvbox', gradient: 'from-[#282828] to-[#3c3836]', accent: '#fabd2f', tags: ['Warm', 'Retro'], preview: '>> Retro mode\n>> Warm colors\n>> Active' },
  { name: 'Cyberpunk', gradient: 'from-[#0a0a0f] to-[#1a0a2e]', accent: '#ff00ff', tags: ['Sci-Fi', 'Glow'], preview: 'WAKE UP SAMURAI\nWE HAVE A CITY\nTO BURN' },
  { name: 'Matrix', gradient: 'from-[#000000] to-[#001100]', accent: '#00ff00', tags: ['Hacker', 'Green'], preview: '01010101 00000000\n11111111 10101010\n00000000 11111111' },
  { name: 'Japanese', gradient: 'from-[#1a1a1a] to-[#2d2d2d]', accent: '#e74c3c', tags: ['Minimal', 'Zen'], preview: '「 こんにちは 」\n\n  ZEN MODE   ' },
  { name: 'Bento', gradient: 'from-[#0f0f0f] to-[#1a1a1a]', accent: '#ffffff', tags: ['Grid', 'Modern'], preview: '+---+ +---+\n|   | |   |\n+---+ +---+' },
  { name: 'Portfolio', gradient: 'from-[#0a0a0a] to-[#1a1a2e]', accent: '#c5ff4a', tags: ['Pro', 'Lime'], preview: "HELLO WORLD.\nI MAKE THINGS.\nLET'S TALK." },
  { name: 'Open Source', gradient: 'from-[#0d1117] to-[#161b22]', accent: '#3fb950', tags: ['Community', 'Green'], preview: 'git commit -m "feat"\ngit push origin main\n🚀 Deployed.' }
];

export default function TemplatesShowcase() {
  const { t } = useI18n();

  return (
    <section id="templates" className="bg-carbon py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 border border-signal-lime text-signal-lime rounded-none text-eyebrow font-inter-tight font-medium tracking-[0.22em] bg-transparent mb-8 uppercase">
            {t('landing.templates.badge', '[ 13 TEMPLATES ]')}
          </div>

          <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-4">
            {t('landing.templates.eyebrow', '[ CHOOSE YOUR STYLE ]')}
          </span>
          <h2 className="font-pt-serif font-light text-heading text-chalk leading-[0.9] tracking-tight mb-6">
            {t('landing.templates.title_normal', 'Premium ')}<span className="italic text-signal-lime">{t('landing.templates.title_italic', 'Templates.')}</span>
          </h2>
          <p className="font-inter-tight text-body text-bone max-w-lg mx-auto">
            {t('landing.templates.subtitle', '13+ beautifully crafted templates. Pick one, customize everything.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {templates.map((template, idx) => (
            <div
              key={idx}
              className="bg-onyx border border-graphite rounded-none hover:border-signal-lime/30 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div
                className={`h-40 w-full bg-linear-to-br ${template.gradient} relative overflow-hidden flex items-center justify-center`}
              >
                <div className="font-jetbrains-mono text-caption sm:text-note leading-tight whitespace-pre opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 text-center" style={{ color: template.accent }}>
                  {template.preview}
                </div>
              </div>

              <div className="p-5 border-t border-graphite bg-onyx flex items-center justify-between z-10 relative group-hover:bg-graphite transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: template.accent }} />
                  <span className="font-inter-tight font-semibold text-body text-chalk">
                    {template.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  {template.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-2 py-0.5 border border-graphite rounded-none font-inter-tight text-caption uppercase text-ash tracking-wide bg-transparent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
