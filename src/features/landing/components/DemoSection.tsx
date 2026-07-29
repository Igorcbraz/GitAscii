'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal as TerminalIcon } from 'lucide-react';
import { APP_URL, APP_DOMAIN } from '../../../constants';

export default function DemoSection() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${APP_URL}/api/Igorcbraz?theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="${APP_URL}/api/Igorcbraz?theme=light" />
  <img alt="Igorcbraz's GitAscii Stats" src="${APP_URL}/api/Igorcbraz" />
</picture>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="bg-carbon py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="flex flex-col items-start text-left">
            <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-4">
              [ SEE IT IN ACTION ]
            </span>
            <h2 className="font-pt-serif font-light text-heading text-chalk leading-[0.9] tracking-tight">
              From Username to <span className="italic text-signal-lime">Masterpiece.</span>
            </h2>
          </div>
          <div className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash shrink-0 hidden md:block">
            [ B 01 ]
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Terminal Side */}
          <div className="lg:col-span-7 bg-onyx border border-graphite rounded-none overflow-hidden flex flex-col min-w-0">
            {/* Window Chrome */}
            <div className="bg-graphite px-4 py-3 flex items-center justify-between border-b border-graphite relative">
              <div className="flex gap-2 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="font-jetbrains-mono text-[11px] text-ash absolute inset-0 flex items-center justify-center pointer-events-none">
                <TerminalIcon size={12} className="mr-1.5" />
                {APP_DOMAIN}/Igorcbraz
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 md:p-8 flex flex-col gap-6 bg-onyx flex-1 overflow-x-auto min-w-0">
              <div className="font-jetbrains-mono text-[13px] md:text-body leading-relaxed w-full min-w-[320px]">
                <div className="text-bone mb-6 flex items-center">
                  <span className="text-signal-lime mr-2">~</span> 
                  <span className="text-ash mr-2">❯</span>
                  <span className="text-chalk mr-1">gitascii --user Igorcbraz</span>
                  <span className="inline-block w-2 h-4 bg-signal-lime animate-pulse ml-1" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="font-jetbrains-mono text-signal-lime text-[11px] md:text-caption leading-none whitespace-pre select-none drop-shadow-[0_0_8px_rgba(197,255,74,0.45)] shrink-0">
                    {`      ░░░░░░░░░░░░░░░░
    ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
   ░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░
  ░▒▓▓████████████▓▓▒░
  ░▒▓██████████████▓▒░
  ░▒▓███▓▓▓▓▓▓▓███▓▒░
   ░▒▓██▓▒▒▒▒▒▒▓██▓▒░
    ░▒▓█▓▒░░░░▒▓█▓▒░
     ░▒▓▓▒░░░░▒▓▓▒░
       ░▒▒▒▒▒▒▒▒░`}
                  </div>

                  <div className="text-bone grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[13px] md:text-body">
                    <span className="text-signal-lime">Name:</span>
                    <span className="text-chalk font-medium">Igor Braz</span>

                    <span className="text-signal-lime">Role:</span>
                    <span className="text-chalk font-medium">Developer</span>

                    <span className="text-signal-lime">Languages:</span>
                    <span className="text-chalk font-medium">TypeScript, React, Node.js</span>

                    <span className="text-signal-lime">Stars:</span>
                    <span className="text-chalk font-medium">142</span>

                    <span className="text-signal-lime">Repos:</span>
                    <span className="text-chalk font-medium">38</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code Side */}
          <div className="lg:col-span-5 flex flex-col min-w-0">
            <div className="relative group/embed flex-1 bg-graphite border border-iron rounded-none p-6 font-jetbrains-mono text-[11px] sm:text-[12px] flex flex-col justify-center min-w-0 min-h-[220px]">
              {/* Floating Copy Button */}
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 bg-onyx hover:bg-iron border border-graphite text-ash hover:text-signal-lime transition-all duration-200 cursor-pointer rounded-none hover:shadow-[0_0_8px_rgba(197,255,74,0.3)]"
                title="Copy code"
              >
                {copied ? (
                  <Check size={14} className="text-signal-lime" />
                ) : (
                  <Copy size={14} />
                )}
              </button>

              <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all pr-8">
                <code className="text-bone leading-relaxed">
                  <span className="text-signal-lime">{'<picture>'}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<source'}</span> media=<span className="text-chalk">"(prefers-color-scheme: dark)"</span>{'\n'}
                  {'    '}srcset=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz?theme=dark\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<source'}</span> media=<span className="text-chalk">"(prefers-color-scheme: light)"</span>{'\n'}
                  {'    '}srcset=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz?theme=light\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<img'}</span> alt=<span className="text-chalk">"Igorcbraz's GitAscii Stats"</span>{'\n'}
                  {'    '}src=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  <span className="text-signal-lime">{'</picture>'}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
