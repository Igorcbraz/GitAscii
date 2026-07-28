'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy, ChevronDown, Pipette } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  align?: 'left' | 'right';
}

const PRESET_SWATCHES = [
  '#c5ff4a', // Signal Lime
  '#00ffff', // Cyber Cyan
  '#ff00ff', // Neon Pink
  '#bd93f9', // Dracula Purple
  '#88c0d0', // Nord Blue
  '#ffb800', // Amber Gold
  '#ff4a4a', // Crimson
  '#060606', // Carbon Black
  '#1f1f1f', // Graphite
  '#2d3748', // Slate Dark
  '#718096', // Cool Ash
  '#ffffff', // Pure White
];

export function ColorPicker({ label, value = '#1f1f1f', onChange, align = 'right' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {label && <label className="text-eyebrow text-ash block mb-1 font-inter-tight font-medium">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-graphite border border-graphite hover:border-slate p-1.5 rounded-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-[3px] border border-white/20 shadow-inner flex items-center justify-center shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-jetbrains-mono text-eyebrow text-chalk uppercase tracking-wider">
            {value}
          </span>
        </div>
        <ChevronDown size={14} className={`text-ash transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'
            } top-full mt-1 w-55 bg-onyx border border-slate p-3 rounded-md shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="text-caption uppercase font-inter-tight font-semibold tracking-wider text-ash mb-2 flex items-center justify-between">
            <span>Color Swatches</span>
            <button
              onClick={handleCopy}
              className="text-ash hover:text-signal-lime transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy Hex"
            >
              {copied ? <Check size={12} className="text-signal-lime" /> : <Copy size={12} />}
              <span className="text-caption">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setHexInput(color);
                }}
                className={`w-6 h-6 rounded-[3px] border transition-transform hover:scale-110 cursor-pointer ${value.toLowerCase() === color.toLowerCase()
                  ? 'border-signal-lime ring-2 ring-signal-lime/40 scale-105'
                  : 'border-white/10 hover:border-white/40'
                  }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-graphite">
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-slate shrink-0 group cursor-pointer">
              <input
                type="color"
                value={value.startsWith('#') && value.length === 7 ? value : '#1f1f1f'}
                onChange={(e) => {
                  onChange(e.target.value);
                  setHexInput(e.target.value);
                }}
                className="absolute -inset-2.5 w-[200%] h-[200%] cursor-pointer opacity-0"
              />
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: value }}
              >
                <Pipette size={12} className="text-white drop-shadow opacity-75 group-hover:opacity-100" />
              </div>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#000000"
                className="w-full bg-graphite border border-graphite focus:border-signal-lime px-2 py-1 text-eyebrow font-jetbrains-mono uppercase text-chalk rounded-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
