'use client';

import React from 'react';

const templates = [
  { name: 'Terminal', gradient: 'from-[#000000] to-[#1a1a2e]', accent: '#00ff00', tags: ['Classic', 'CLI'] },
  { name: 'Minimal', gradient: 'from-[#ffffff] to-[#f5f5f5]', accent: '#000000', tags: ['Clean', 'Light'] },
  { name: 'GitHub Dark', gradient: 'from-[#0d1117] to-[#161b22]', accent: '#58a6ff', tags: ['Native', 'Dark'] },
  { name: 'Dracula', gradient: 'from-[#282a36] to-[#44475a]', accent: '#bd93f9', tags: ['Theme', 'Vibrant'] },
  { name: 'Nord', gradient: 'from-[#2e3440] to-[#3b4252]', accent: '#88c0d0', tags: ['Cold', 'Elegant'] },
  { name: 'Tokyo Night', gradient: 'from-[#1a1b26] to-[#24283b]', accent: '#7aa2f7', tags: ['Neon', 'Modern'] },
  { name: 'Gruvbox', gradient: 'from-[#282828] to-[#3c3836]', accent: '#fabd2f', tags: ['Warm', 'Retro'] },
  { name: 'Cyberpunk', gradient: 'from-[#0a0a0f] to-[#1a0a2e]', accent: '#ff00ff', tags: ['Sci-Fi', 'Glow'] },
  { name: 'Matrix', gradient: 'from-[#000000] to-[#001100]', accent: '#00ff00', tags: ['Hacker', 'Green'] },
  { name: 'Japanese', gradient: 'from-[#1a1a1a] to-[#2d2d2d]', accent: '#e74c3c', tags: ['Minimal', 'Zen'] },
  { name: 'Bento', gradient: 'from-[#0f0f0f] to-[#1a1a1a]', accent: '#ffffff', tags: ['Grid', 'Modern'] },
  { name: 'Portfolio', gradient: 'from-[#0a0a0a] to-[#1a1a2e]', accent: '#c5ff4a', tags: ['Pro', 'Lime'] },
  { name: 'Open Source', gradient: 'from-[#0d1117] to-[#161b22]', accent: '#3fb950', tags: ['Community', 'Green'] }
];

export default function TemplatesShowcase() {
  return (
    <section id="templates" className="bg-carbon py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 border border-signal-lime text-signal-lime rounded-full text-[11px] font-inter-tight font-medium tracking-[0.22em] bg-transparent mb-8">
            13 TEMPLATES
          </div>

          <span className="font-inter-tight text-[11px] uppercase tracking-[0.22em] text-ash mb-4">
            [ CHOOSE YOUR STYLE ]
          </span>
          <h2 className="font-pt-serif font-light text-heading text-chalk leading-[0.9] tracking-tight mb-6">
            Premium <span className="italic text-signal-lime">Templates.</span>
          </h2>
          <p className="font-inter-tight text-body text-bone max-w-lg mx-auto">
            13+ beautifully crafted templates. Pick one, customize everything.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {templates.map((template, idx) => (
            <div
              key={idx}
              className="bg-onyx border border-graphite rounded-none hover:border-signal-lime transition-colors duration-300 cursor-pointer group flex flex-col"
            >
              <div
                className={`h-40 w-full bg-linear-to-br ${template.gradient} relative overflow-hidden`}
              >
                <div className="absolute inset-0 p-6 flex flex-col gap-3 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
                  <div className="w-1/3 h-2 rounded-full" style={{ backgroundColor: template.accent }} />
                  <div className="w-3/4 h-2 rounded-full bg-current" style={{ color: template.accent }} />
                  <div className="w-1/2 h-2 rounded-full bg-current" style={{ color: template.accent }} />
                  <div className="w-2/3 h-2 rounded-full bg-current mt-4" style={{ color: template.accent }} />
                </div>
              </div>

              <div className="p-5 border-t border-graphite bg-onyx flex items-center justify-between">
                <span className="font-inter-tight font-medium text-body text-chalk">
                  {template.name}
                </span>
                <div className="flex gap-2">
                  {template.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-2 py-0.5 border border-graphite rounded-xs font-inter-tight text-caption uppercase text-ash tracking-wide bg-transparent"
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
