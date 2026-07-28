'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github } from 'lucide-react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenEditor = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = username.trim() || 'Igorcbraz';
    router.push(`/${handle}`);
  };

  const handleGenerateBest = () => {
    const handle = username.trim() || 'Igorcbraz';
    router.push(`/${handle}?generate=true`);
  };

  const particles = mounted
    ? Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${Math.random() * 15 + 15}s`,
      delay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.3 + 0.1,
    }))
    : [];

  return (
    <div className="relative min-h-screen w-full bg-carbon flex flex-col overflow-hidden">
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          100% {
            transform: translateY(-25px) translateX(15px);
          }
        }
        .animate-float {
          animation: float infinite alternate ease-in-out;
        }
      `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-signal-lime animate-float"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grow flex-col items-center justify-center px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-150 mb-8">
            <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash">
              [ THE FUTURE OF GITHUB PROFILES ]
            </span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300 font-pt-serif font-light text-white text-5xl md:text-heading-lg leading-hero md:leading-heading-lg tracking-heading-lg mb-8">
            Create <span className="italic text-signal-lime">Stunning</span> GitHub Profile READMEs.
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-500 font-inter-tight font-normal text-bone text-body leading-body max-w-130 mb-12">
            Premium SVGs. ASCII art. Visual editor. One platform for developers who care about their profile.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-700 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <form onSubmit={handleOpenEditor} className="flex w-full group">
              <div className="relative grow flex items-center">
                <Github className="absolute left-4 w-5 h-5 text-ash" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="w-full bg-onyx border border-graphite text-white font-inter-tight text-body py-3.5 pl-11 pr-5 rounded-l-sm focus:outline-none focus:border-signal-lime focus:ring-1 focus:ring-signal-lime transition-all"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 bg-signal-lime text-black font-inter-tight font-medium text-body py-3.5 px-6 rounded-r-sm transition-all duration-300 shadow-[0_0_8px_rgba(197,255,74,0.45)] hover:shadow-[0_0_12px_rgba(197,255,74,0.65)] hover:brightness-110 flex items-center gap-2 cursor-pointer"
              >
                Open Editor <ArrowRight size={16} />
              </button>
            </form>

            <button
              type="button"
              onClick={handleGenerateBest}
              className="font-inter-tight font-medium text-label text-signal-lime flex items-center gap-1 group/btn relative cursor-pointer hover:text-signal-lime bg-transparent border-none"
            >
              ✨ Generate Best Profile
              <span className="absolute bottom-0 left-0 w-full h-px bg-signal-lime transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)]"></div>
    </div>
  );
}
