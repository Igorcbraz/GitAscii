import { Globe } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

export interface CountryFlagProps {
  code?: string | null
  name?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const FLAG_SVGS: Record<string, React.ReactNode> = {
  US: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#bd3d44" d="M0 0h640v480H0z" />
      <path
        stroke="#fff"
        strokeWidth="37"
        d="M0 55.4h640M0 129.2h640M0 203.1h640M0 277h640M0 350.8h640M0 424.6h640"
      />
      <path fill="#192f5d" d="M0 0h260v258.5H0z" />
      <g fill="#fff">
        <circle cx="28" cy="24" r="7" />
        <circle cx="70" cy="24" r="7" />
        <circle cx="112" cy="24" r="7" />
        <circle cx="154" cy="24" r="7" />
        <circle cx="196" cy="24" r="7" />
        <circle cx="238" cy="24" r="7" />
        <circle cx="49" cy="48" r="7" />
        <circle cx="91" cy="48" r="7" />
        <circle cx="133" cy="48" r="7" />
        <circle cx="175" cy="48" r="7" />
        <circle cx="217" cy="48" r="7" />
        <circle cx="28" cy="72" r="7" />
        <circle cx="70" cy="72" r="7" />
        <circle cx="112" cy="72" r="7" />
        <circle cx="154" cy="72" r="7" />
        <circle cx="196" cy="72" r="7" />
        <circle cx="238" cy="72" r="7" />
        <circle cx="49" cy="96" r="7" />
        <circle cx="91" cy="96" r="7" />
        <circle cx="133" cy="96" r="7" />
        <circle cx="175" cy="96" r="7" />
        <circle cx="217" cy="96" r="7" />
        <circle cx="28" cy="120" r="7" />
        <circle cx="70" cy="120" r="7" />
        <circle cx="112" cy="120" r="7" />
        <circle cx="154" cy="120" r="7" />
        <circle cx="196" cy="120" r="7" />
        <circle cx="238" cy="120" r="7" />
        <circle cx="49" cy="144" r="7" />
        <circle cx="91" cy="144" r="7" />
        <circle cx="133" cy="144" r="7" />
        <circle cx="175" cy="144" r="7" />
        <circle cx="217" cy="144" r="7" />
        <circle cx="28" cy="168" r="7" />
        <circle cx="70" cy="168" r="7" />
        <circle cx="112" cy="168" r="7" />
        <circle cx="154" cy="168" r="7" />
        <circle cx="196" cy="168" r="7" />
        <circle cx="238" cy="168" r="7" />
        <circle cx="49" cy="192" r="7" />
        <circle cx="91" cy="192" r="7" />
        <circle cx="133" cy="192" r="7" />
        <circle cx="175" cy="192" r="7" />
        <circle cx="217" cy="192" r="7" />
        <circle cx="28" cy="216" r="7" />
        <circle cx="70" cy="216" r="7" />
        <circle cx="112" cy="216" r="7" />
        <circle cx="154" cy="216" r="7" />
        <circle cx="196" cy="216" r="7" />
        <circle cx="238" cy="216" r="7" />
      </g>
    </svg>
  ),
  BR: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#009c3b" d="M0 0h640v480H0z" />
      <path fill="#ffdf00" d="M320 40L580 240 320 440 60 240z" />
      <circle fill="#002776" cx="320" cy="240" r="100" />
      <path fill="#fff" d="M225 255a108 108 0 0 1 190-25c-8 30-80 35-190 25z" />
      <circle fill="#fff" cx="320" cy="200" r="4" />
      <circle fill="#fff" cx="300" cy="230" r="3" />
      <circle fill="#fff" cx="340" cy="250" r="3.5" />
      <circle fill="#fff" cx="310" cy="270" r="3" />
      <circle fill="#fff" cx="330" cy="285" r="2.5" />
    </svg>
  ),
  DE: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#000" d="M0 0h640v160H0z" />
      <path fill="#dd0000" d="M0 160h640v160H0z" />
      <path fill="#ffce00" d="M0 320h640v160H0z" />
    </svg>
  ),
  GB: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="60" />
      <path fill="#c8102e" d="M0 0l640 480M640 0L0 480" stroke="#c8102e" strokeWidth="36" />
      <path fill="#fff" d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="100" />
      <path fill="#c8102e" d="M320 0v480M0 240h640" stroke="#c8102e" strokeWidth="60" />
    </svg>
  ),
  FR: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#002654" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
    </svg>
  ),
  CA: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#f00" d="M0 0h160v480H0zm480 0h160v480H480z" />
      <path fill="#fff" d="M160 0h320v480H160z" />
      <path
        fill="#f00"
        d="M320 100l18 36 34-12-14 36 36 12-24 24 16 38-38-6-8 28-20-16-20 16-8-28-38 6 16-38-24-24 36-12-14-36 34 12 18-36zM315 280h10v60h-10z"
      />
    </svg>
  ),
  IN: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#ff9933" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#138808" d="M0 320h640v160H0z" />
      <circle fill="#000080" cx="320" cy="240" r="40" />
      <circle fill="#fff" cx="320" cy="240" r="32" />
      <circle fill="#000080" cx="320" cy="240" r="8" />
    </svg>
  ),
  JP: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#fff" d="M0 0h640v480H0z" />
      <circle fill="#bc002d" cx="320" cy="240" r="144" />
    </svg>
  ),
  AU: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#00008b" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M0 0h320v240H0z" />
      <path fill="#012169" d="M0 0h320v240H0z" />
      <path stroke="#fff" strokeWidth="30" d="M0 0l320 240M320 0L0 240" />
      <path stroke="#c8102e" strokeWidth="18" d="M0 0l320 240M320 0L0 240" />
      <path stroke="#fff" strokeWidth="50" d="M160 0v240M0 120h320" />
      <path stroke="#c8102e" strokeWidth="30" d="M160 0v240M0 120h320" />
      <circle fill="#fff" cx="160" cy="360" r="30" />
      <circle fill="#fff" cx="480" cy="120" r="12" />
      <circle fill="#fff" cx="540" cy="200" r="12" />
      <circle fill="#fff" cx="480" cy="360" r="12" />
      <circle fill="#fff" cx="420" cy="240" r="12" />
    </svg>
  ),
  CN: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#ee1c25" d="M0 0h640v480H0z" />
      <circle fill="#ffde00" cx="100" cy="100" r="36" />
      <circle fill="#ffde00" cx="180" cy="40" r="12" />
      <circle fill="#ffde00" cx="220" cy="80" r="12" />
      <circle fill="#ffde00" cx="220" cy="140" r="12" />
      <circle fill="#ffde00" cx="180" cy="180" r="12" />
    </svg>
  ),
  KR: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#fff" d="M0 0h640v480H0z" />
      <path
        fill="#cd2e3a"
        d="M320 140a100 100 0 0 1 0 200c-55 0-55-100-100-100a50 50 0 0 1 100-100z"
      />
      <path
        fill="#0047a0"
        d="M320 340a100 100 0 0 1 0-200c55 0 55 100 100 100a50 50 0 0 1-100 100z"
      />
    </svg>
  ),
  ES: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#aa151b" d="M0 0h640v120H0zm0 360h640v120H0z" />
      <path fill="#f1bf00" d="M0 120h640v240H0z" />
    </svg>
  ),
  IT: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#009246" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
    </svg>
  ),
  NL: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#ae1c28" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#21468b" d="M0 320h640v160H0z" />
    </svg>
  ),
  SE: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#006aa7" d="M0 0h640v480H0z" />
      <path fill="#fecc00" d="M190 0h60v480h-60zM0 210h640v60H0z" />
    </svg>
  ),
  RU: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#fff" d="M0 0h640v160H0z" />
      <path fill="#0039a6" d="M0 160h640v160H0z" />
      <path fill="#d52b1e" d="M0 320h640v160H0z" />
    </svg>
  ),
  PL: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#fff" d="M0 0h640v240H0z" />
      <path fill="#dc143c" d="M0 240h640v240H0z" />
    </svg>
  ),
  MX: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#006847" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
      <circle fill="#9e6938" cx="320" cy="240" r="30" />
    </svg>
  ),
  AR: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#74acdf" d="M0 0h640v160H0zm0 320h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <circle fill="#f6b40e" cx="320" cy="240" r="30" />
    </svg>
  ),
  PT: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#046a38" d="M0 0h256v480H0z" />
      <path fill="#da291c" d="M256 0h384v480H256z" />
      <circle fill="#ffcd00" cx="256" cy="240" r="50" />
    </svg>
  ),
  CH: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#d52b1e" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M280 120h80v240h-80zM200 200h240v80H200z" />
    </svg>
  ),
  ZA: (
    <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
      <path fill="#007749" d="M0 0h640v480H0z" />
      <path fill="#e03c31" d="M240 0h400v160H240z" />
      <path fill="#001489" d="M240 320h400v160H240z" />
      <path fill="#000" d="M0 40L140 240 0 440z" />
      <path fill="#ffb612" d="M0 0l200 240L0 480h80l200-240L80 0z" />
    </svg>
  ),
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  name,
  className = '',
  size = 'md',
}) => {
  const { t } = useI18n()
  const normalizedCode = code ? code.toUpperCase().trim() : ''

  const sizeClasses = {
    sm: 'w-4 h-3 rounded-[2px]',
    md: 'w-5 h-3.5 rounded-[3px]',
    lg: 'w-6 h-4.5 rounded-[4px]',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  if (!normalizedCode || normalizedCode === 'XX' || normalizedCode === 'ZZ') {
    return (
      <div
        className={`inline-flex items-center justify-center text-[#8a8a8a] ${className}`}
        title={name || t('pro.geo.unknown_location', 'Unknown Location')}
      >
        <Globe className={iconSizes[size]} />
      </div>
    )
  }

  const flagContent = FLAG_SVGS[normalizedCode]

  if (flagContent) {
    return (
      <div
        className={`inline-flex items-center justify-center overflow-hidden border border-white/20 shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title={name || normalizedCode}
      >
        {flagContent}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold text-[9px] uppercase bg-white/10 text-white/90 border border-white/20 px-1 py-0.5 rounded ${className}`}
      title={name || normalizedCode}
    >
      {normalizedCode}
    </div>
  )
}
