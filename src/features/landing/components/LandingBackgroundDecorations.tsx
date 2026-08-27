'use client'

import React from 'react'

export function LandingBackgroundDecorations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[18%] opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
      />
      <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-signal-lime/[0.04] blur-[160px] rounded-full" />

      <div className="absolute top-[18%] left-0 right-0 h-[16%] bg-void-black/70" />

      <div
        className="absolute top-[34%] left-0 right-0 h-[16%] opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(197, 255, 74, 0.9) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
      />
      <div className="absolute top-[40%] right-[10%] w-[800px] h-[500px] bg-signal-lime/[0.035] blur-[150px] rounded-full" />

      <div className="absolute top-[50%] left-0 right-0 h-[16%] bg-void-black/70" />

      <div
        className="absolute top-[66%] left-0 right-0 h-[16%] opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        }}
      />
      <div className="absolute top-[72%] left-[10%] w-[850px] h-[550px] bg-signal-lime/[0.03] blur-[160px] rounded-full" />

      <div className="absolute top-[82%] left-0 right-0 h-[10%] bg-void-black/80" />

      <div className="absolute top-[92%] right-[15%] w-[800px] h-[450px] bg-signal-lime/[0.04] blur-[150px] rounded-full" />

      <div className="absolute left-4 md:left-8 xl:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-signal-lime/20 via-white/5 to-signal-lime/20 hidden md:block" />
      <div className="absolute right-4 md:right-8 xl:right-14 top-0 bottom-0 w-px bg-gradient-to-b from-signal-lime/20 via-white/5 to-signal-lime/20 hidden md:block" />

      <div className="absolute top-[1.5%] left-4 lg:left-16 font-jetbrains-mono text-[12px] text-pearl/50 tracking-wider">
        <span className="text-signal-lime/80 font-bold">{'//'}</span> [sys.pipeline: ready]
        <br />
        <span className="text-ash/60">0x00A4 // init_layout_stream</span>
      </div>

      <div className="absolute top-[2%] right-4 lg:right-16 font-jetbrains-mono text-[11px] text-signal-lime/60 tracking-widest hidden md:block">
        [SYS_STATUS: ONLINE]
        <br />
        <span className="text-ash/50">LATENCY ~0.4ms // EDGE</span>
      </div>

      <pre className="absolute top-[7.5%] right-4 lg:right-16 font-jetbrains-mono text-[11px] leading-[14px] text-signal-lime/40 hidden lg:block bg-void-black/50 p-2 border border-signal-lime/20 rounded-sm">
        {`+-----------------------+
| ARCH: EDGE_SERVERLESS |
| RENDER: SVG_PIPELINE  |
| CACHE: CDN_HIT_99.8%  |
+-----------------------+`}
      </pre>

      <pre className="absolute top-[36%] left-4 lg:left-16 font-jetbrains-mono text-[11px] leading-[15px] text-signal-lime/40 hidden lg:block bg-void-black/50 p-2.5 border border-signal-lime/20 rounded-sm">
        {`  [GITHUB API] ---> [ASCII PARSER]
                         |
                         v
                [SVG RENDER ENGINE] ---> [README.MD]`}
      </pre>

      <pre className="absolute top-[42%] right-4 lg:right-16 font-jetbrains-mono text-[11px] leading-[14px] text-signal-lime/45 hidden lg:block bg-void-black/50 p-2 border border-graphite rounded-sm">
        {`/* TEMPLATE_ENGINE */
.badge { 
  fill: #c5ff4a; 
  filter: drop-shadow(0 0 8px); 
}`}
      </pre>

      <div className="absolute top-[68%] left-4 lg:left-16 font-jetbrains-mono text-[11px] text-signal-lime/55 hidden md:block">
        <span className="text-ash/50"># ecosystem_connectivity</span>
        <br />
        <span>HTTP/2 200 OK &bull; camo.githubusercontent.com</span>
      </div>

      <pre className="absolute top-[74%] right-4 lg:right-16 font-jetbrains-mono text-[11px] leading-[14px] text-signal-lime/40 hidden lg:block bg-void-black/50 p-2 border border-signal-lime/20 rounded-sm">
        {`// CAMO COMPATIBILITY LAYER
headers: {
  'Content-Type': 'image/svg+xml',
  'Cache-Control': 'max-age=1800'
}`}
      </pre>

      <pre className="absolute top-[93%] left-4 lg:left-16 font-jetbrains-mono text-[11px] leading-[15px] text-signal-lime/60 hidden lg:block bg-void-black/60 p-3 border border-signal-lime/30 rounded-sm">
        {`+----------------------------------+
|  >>> READY TO LEVEL UP PROFILE?  |
|  $ git ascii --generate          |
+----------------------------------+`}
      </pre>

      <div className="absolute top-[96%] right-6 lg:right-16 font-jetbrains-mono text-[11px] text-pearl/50 hidden md:block">
        <span>[ 100% OPEN SOURCE &bull; MIT LICENSED ]</span>
      </div>

      <span className="absolute top-[5%] left-[12%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
      <span className="absolute top-[10%] right-[14%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
      <span className="absolute top-[38%] left-[15%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
      <span className="absolute top-[44%] right-[12%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
      <span className="absolute top-[70%] left-[12%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
      <span className="absolute top-[76%] right-[16%] font-jetbrains-mono text-sm text-signal-lime/30 select-none hidden md:block">
        +
      </span>
    </div>
  )
}
