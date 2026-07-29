'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-4">
            [ SEE IT IN ACTION ]
          </span>
          <h2 className="font-pt-serif font-light text-heading text-chalk leading-[0.9] tracking-tight">
            From Username to <span className="italic text-signal-lime">Masterpiece.</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-onyx border border-graphite rounded-none overflow-hidden mb-8">
            <div className="bg-graphite px-4 py-3 flex items-center border-b border-graphite">
              <div className="flex gap-2 mr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="font-jetbrains-mono text-label text-ash mx-auto -ml-12">
                {APP_DOMAIN}/Igorcbraz
              </div>
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-onyx">
              <div className="font-jetbrains-mono text-signal-lime text-caption leading-none whitespace-pre select-none">
                {`
      ░░░░░░░░░░░░░░░░
    ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
   ░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░
  ░▒▓▓████████████▓▓▒░
  ░▒▓██████████████▓▒░
  ░▒▓███▓▓▓▓▓▓▓███▓▒░
   ░▒▓██▓▒▒▒▒▒▒▓██▓▒░
    ░▒▓█▓▒░░░░▒▓█▓▒░
     ░▒▓▓▒░░░░▒▓▓▒░
       ░▒▒▒▒▒▒▒▒░
`}
              </div>

              <div className="font-jetbrains-mono text-label leading-relaxed w-full">
                <div className="text-signal-lime mb-4">
                  $ gitascii --user Igorcbraz
                </div>
                <div className="text-bone grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-signal-lime">Name:</span>
                  <span>Igor Braz</span>

                  <span className="text-signal-lime">Role:</span>
                  <span>Developer</span>

                  <span className="text-signal-lime">Languages:</span>
                  <span>TypeScript, React, Node.js</span>

                  <span className="text-signal-lime">Stars:</span>
                  <span>142</span>

                  <span className="text-signal-lime">Repos:</span>
                  <span>38</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 bg-graphite border border-iron rounded-sm p-4 font-jetbrains-mono text-label overflow-x-auto w-full">
              <pre>
                <code className="text-bone">
                  <span className="text-signal-lime">{'<picture>'}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<source'}</span> media=<span className="text-chalk">"(prefers-color-scheme: dark)"</span> srcset=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz?theme=dark\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<source'}</span> media=<span className="text-chalk">"(prefers-color-scheme: light)"</span> srcset=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz?theme=light\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  {'  '}<span className="text-signal-lime">{'<img'}</span> alt=<span className="text-chalk">"Igorcbraz's GitAscii Stats"</span> src=<span className="text-chalk">"{`\"${APP_URL}/api/Igorcbraz\"`}"</span> <span className="text-signal-lime">{`/>`}</span>{'\n'}
                  <span className="text-signal-lime">{'</picture>'}</span>
                </code>
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-transparent border border-signal-lime text-signal-lime px-6 py-3.5 rounded-sm font-inter-tight font-medium hover:bg-signal-lime/10 transition-colors w-full sm:w-auto justify-center cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
