"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              className="font-inter-tight text-[13px] font-medium uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:text-signal-lime"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <button className="rounded-sm border border-signal-lime bg-transparent px-5 py-2.5 font-inter-tight text-[13px] font-medium uppercase tracking-[0.08em] text-signal-lime transition-all duration-300 hover:bg-signal-lime hover:text-black hover:shadow-[0_0_8px_rgba(197,255,74,0.45)] cursor-pointer">
            GET STARTED
          </button>
        </div>
        <button
          className="md:hidden text-white cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full bg-void-black border-b border-graphite px-6 py-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 shadow-xl z-40">
          {['FEATURES', 'TEMPLATES', 'HOW IT WORKS', 'FAQ'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-inter-tight text-[13px] font-medium uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:text-signal-lime block py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <button className="mt-2 rounded-sm border border-signal-lime bg-transparent px-5 py-2.5 font-inter-tight text-[13px] font-medium uppercase tracking-[0.08em] text-signal-lime transition-all duration-300 hover:bg-signal-lime hover:text-black hover:shadow-[0_0_8px_rgba(197,255,74,0.45)] w-full text-center cursor-pointer">
            GET STARTED
          </button>
        </div>
      )}
    </nav>
  );
}
