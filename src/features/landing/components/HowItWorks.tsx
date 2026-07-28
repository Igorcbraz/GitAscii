'use client';

import { Copy } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-carbon py-32 px-6 md:px-12 w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col">
        <div className="mb-24 flex flex-col items-center text-center">
          <span className="font-sans font-medium text-[11px] uppercase tracking-[0.22em] text-ash mb-4">
            [ THREE STEPS ]
          </span>
          <h2 className="font-serif font-light text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            Simple. <em className="italic text-signal-lime">Powerful.</em>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row relative gap-12 lg:gap-8">
          <div className="hidden lg:block absolute top-29 left-[16.66%] right-[16.66%] h-px border-t border-dashed border-graphite z-0" />

          <div className="flex-1 flex flex-col relative z-10">
            <div className="h-58 bg-onyx border border-graphite mb-8 rounded-none p-6 flex flex-col justify-center items-center relative group">
              <div className="absolute top-4 left-4 font-serif font-light text-heading-lg leading-none text-graphite select-none">
                01
              </div>
              <div className="w-full max-w-50 h-10 border border-graphite bg-carbon flex items-center px-3 z-10 group-hover:border-iron transition-colors duration-300">
                <span className="font-mono text-[13px] text-bone">
                  Igorcbraz<span className="animate-pulse text-signal-lime">_</span>
                </span>
              </div>
              <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-signal-lime z-20 shadow-[0_0_8px_rgba(197,255,74,0.45)]" />
            </div>
            <h3 className="font-sans font-medium text-subheading text-chalk mb-3">Enter Your Username</h3>
            <p className="font-sans font-normal text-body text-bone leading-body">
              Just type your GitHub username. We fetch everything automatically.
            </p>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            <div className="h-58 bg-onyx border border-graphite mb-8 rounded-none p-6 flex flex-col justify-center items-center relative group">
              <div className="absolute top-4 left-4 font-serif font-light text-heading-lg leading-none text-graphite select-none">
                02
              </div>
              <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-signal-lime z-20 shadow-[0_0_8px_rgba(197,255,74,0.45)]" />
              <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-signal-lime z-20 shadow-[0_0_8px_rgba(197,255,74,0.45)]" />

              <div className="flex gap-2 w-full max-w-65 h-30 z-10">
                <div className="w-10 h-full border border-graphite bg-carbon group-hover:border-iron transition-colors duration-300" />
                <div className="flex-1 h-full border border-graphite bg-carbon group-hover:border-iron transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute inset-4 border border-dashed border-graphite" />
                </div>
                <div className="w-12.5 h-full border border-graphite bg-carbon group-hover:border-iron transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-sans font-medium text-subheading text-chalk mb-3">Customize Everything</h3>
            <p className="font-sans font-normal text-body text-bone leading-body">
              Use our visual editor to drag widgets, pick templates, and tune every detail. Or let us generate the best profile for you.
            </p>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            <div className="h-58 bg-onyx border border-graphite mb-8 rounded-none p-6 flex flex-col justify-center items-center relative group">
              <div className="absolute top-4 left-4 font-serif font-light text-heading-lg leading-none text-graphite select-none">
                03
              </div>
              <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-signal-lime z-20 shadow-[0_0_8px_rgba(197,255,74,0.45)]" />

              <div className="w-full max-w-65 h-20 border border-graphite bg-carbon p-3 z-10 relative flex flex-col justify-center group-hover:border-iron transition-colors duration-300">
                <div className="font-mono text-[11px] text-ash flex flex-col gap-1">
                  <span>&lt;picture&gt;</span>
                  <span className="pl-4 text-graphite">...</span>
                  <span>&lt;/picture&gt;</span>
                </div>
                <div className="absolute top-3 right-3 w-6 h-6 border border-graphite flex items-center justify-center bg-onyx text-ash group-hover:text-signal-lime group-hover:border-signal-lime/50 transition-colors duration-300 cursor-pointer">
                  <Copy className="w-3 h-3" />
                </div>
              </div>
            </div>
            <h3 className="font-sans font-medium text-subheading text-chalk mb-3">Copy & Paste</h3>
            <p className="font-sans font-normal text-body text-bone leading-body">
              Copy one line of code to your README. Your profile SVG stays always up-to-date via our URL.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
