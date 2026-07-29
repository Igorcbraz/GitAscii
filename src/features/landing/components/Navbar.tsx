"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Github, Star } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/Igorcbraz/GitAscii')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-void-black border-b border-graphite transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-inter-tight text-subheading font-medium text-white tracking-tight">
            Git
          </span>
          <span className="font-pt-serif text-subheading font-light italic text-signal-lime tracking-tight">
            Ascii
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['FEATURES', 'TEMPLATES', 'HOW IT WORKS', 'FAQ'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-inter-tight text-[13px] font-medium uppercase tracking-[0.18em] text-white transition-colors duration-300 ease-in-out hover:text-signal-lime"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <a
            href="https://github.com/Igorcbraz/GitAscii"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-sm border border-graphite bg-onyx px-4 py-2 font-inter-tight text-[13px] font-medium text-white transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.98] hover:border-signal-lime hover:bg-onyx/80 hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] group cursor-pointer"
          >
            <Github className="size-4 text-ash group-hover:text-white transition-colors duration-300 ease-in-out" />
            <span className="transition-colors duration-300 ease-in-out text-white group-hover:text-white">Star</span>
            <span className="h-3 w-[1px] bg-graphite transition-colors duration-300 ease-in-out group-hover:bg-graphite/60" />
            <div className="flex items-center gap-1 text-ash group-hover:text-signal-lime transition-colors duration-300 ease-in-out">
              <Star className="size-3.5 fill-current" />
              <span>{stars !== null ? stars : '—'}</span>
            </div>
          </a>
        </div>
        <button
          className="md:hidden text-white cursor-pointer transition-colors duration-300 ease-in-out hover:text-signal-lime"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full bg-void-black border-b border-graphite px-6 py-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 ease-in-out shadow-xl z-40">
          {['FEATURES', 'TEMPLATES', 'HOW IT WORKS', 'FAQ'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-inter-tight text-[13px] font-medium uppercase tracking-[0.18em] text-white transition-colors duration-300 ease-in-out hover:text-signal-lime block py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <a
            href="https://github.com/Igorcbraz/GitAscii"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2.5 rounded-sm border border-graphite bg-onyx px-5 py-2.5 font-inter-tight text-[13px] font-medium text-white transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:border-signal-lime hover:bg-onyx/80 hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] w-full text-center cursor-pointer group"
          >
            <Github className="size-4 text-ash group-hover:text-white transition-colors duration-300 ease-in-out" />
            <span className="transition-colors duration-300 ease-in-out">Star on GitHub</span>
            <span className="h-3 w-[1px] bg-graphite" />
            <div className="flex items-center gap-1 text-ash group-hover:text-signal-lime transition-colors duration-300 ease-in-out">
              <Star className="size-3.5 fill-current" />
              <span>{stars !== null ? stars : '—'}</span>
            </div>
          </a>
        </div>
      )}
    </nav>
  );
}
