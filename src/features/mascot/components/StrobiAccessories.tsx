'use client'

import React from 'react'

import type { GitAsciiAvatarTheme } from '@/components/avatar'

import type { GazeVector, StrobiAccessory, StrobiMood } from '../core/types'

export interface StrobiAccessoriesProps {
  accessory?: StrobiAccessory
  gazeVector?: GazeVector
  mood?: StrobiMood
  theme?: GitAsciiAvatarTheme
  isHovered?: boolean
}

export const StrobiAccessories = React.memo(function StrobiAccessories({
  accessory = 'none',
  gazeVector,
  mood: _mood,
  theme: _theme = 'dark',
  isHovered: _isHovered,
}: StrobiAccessoriesProps) {
  if (!accessory || accessory === 'none') return null

  const gx = gazeVector ? gazeVector.nx * 7 : 0
  const gy = gazeVector ? gazeVector.ny * 5 : 0

  return (
    <g className="strobi-accessories" style={{ pointerEvents: 'none' }}>
      {accessory === 'popcorn' && (
        <g id="acc-popcorn">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px) rotate(5deg)`,
              transformOrigin: '0px -105px',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <ellipse cx="6" cy="-96" rx="42" ry="10" fill="rgba(0,0,0,0.35)" />

            <path
              d="M -34 -102 L -28 -134 C -28 -136 40 -136 40 -134 L 46 -102 Z"
              fill="#c92a2a"
              stroke="#821414"
              strokeWidth="2.5"
            />
            <path
              d="M -34 -102 Q 6 -96 46 -102"
              fill="none"
              stroke="#ffd700"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M -34 -102 Q 6 -96 46 -102"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            <ellipse
              cx="6"
              cy="-134"
              rx="34"
              ry="9"
              fill="#e03131"
              stroke="#821414"
              strokeWidth="2"
            />

            <circle cx="6" cy="-117" r="7" fill="#ffd700" stroke="#b39200" strokeWidth="1.2" />
            <polygon
              points="6,-122 7.8,-118 12,-118 8.6,-115.5 9.8,-111.5 6,-114 2.2,-111.5 3.4,-115.5 0,-118 4.2,-118"
              fill="#c92a2a"
            />
          </g>

          <g
            style={{
              transform: `translate(${gx * 0.35}px, ${gy * 0.35}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <ellipse cx="88" cy="122" rx="26" ry="7" fill="rgba(0,0,0,0.4)" />

            <path
              d="M 58 46 L 68 120 C 69 123 107 123 108 120 L 118 46 Z"
              fill="#ffffff"
              stroke="#141416"
              strokeWidth="3"
            />

            <path d="M 66 46 L 74 121 L 82 121 L 76 46 Z" fill="#e63946" />
            <path d="M 86 46 L 88 121 L 96 121 L 96 46 Z" fill="#e63946" />
            <path d="M 106 46 L 102 121 L 108 120 L 116 46 Z" fill="#e63946" />

            <rect
              x="64"
              y="74"
              width="48"
              height="20"
              rx="4"
              fill="#ffd166"
              stroke="#e63946"
              strokeWidth="1.8"
            />
            <text
              x="88"
              y="88.5"
              fill="#821414"
              fontSize="9.5"
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              POPCORN
            </text>

            <g id="popcorn-kernels">
              <circle cx="68" cy="42" r="11" fill="#ffe3a8" stroke="#d49b25" strokeWidth="1.4" />
              <circle cx="88" cy="38" r="13" fill="#fff3c4" stroke="#d49b25" strokeWidth="1.4" />
              <circle cx="108" cy="42" r="11" fill="#ffe3a8" stroke="#d49b25" strokeWidth="1.4" />

              <circle cx="76" cy="30" r="11.5" fill="#ffd166" stroke="#d49b25" strokeWidth="1.4" />
              <circle cx="98" cy="28" r="12" fill="#ffd166" stroke="#d49b25" strokeWidth="1.4" />

              <circle cx="87" cy="20" r="10" fill="#fff8dc" stroke="#d49b25" strokeWidth="1.4" />

              <ellipse cx="86" cy="34" rx="4.5" ry="2.5" fill="#f4a261" />
              <ellipse cx="98" cy="25" rx="3.5" ry="1.8" fill="#f4a261" />
              <circle cx="74" cy="27" r="2.2" fill="#ffffff" opacity="0.8" />
              <circle cx="86" cy="18" r="2.2" fill="#ffffff" opacity="0.9" />
            </g>

            <g style={{ animation: 'float 2.2s ease-in-out infinite' }}>
              <circle cx="126" cy="16" r="6.5" fill="#ffd166" stroke="#d49b25" strokeWidth="1.2" />
              <ellipse cx="124" cy="14" rx="2" ry="1.2" fill="#ffffff" opacity="0.9" />
              <path
                d="M 112 36 Q 122 28 124 22"
                fill="none"
                stroke="rgba(255,209,102,0.8)"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
            </g>
            <g style={{ animation: 'float 1.8s ease-in-out infinite alternate' }}>
              <circle cx="62" cy="12" r="5.5" fill="#ffe3a8" stroke="#d49b25" strokeWidth="1.2" />
              <ellipse cx="60" cy="11" rx="1.8" ry="1" fill="#ffffff" opacity="0.9" />
            </g>
          </g>
        </g>
      )}

      {accessory === 'businessman' && (
        <g id="acc-businessman">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px) rotate(-4deg)`,
              transformOrigin: '0px -100px',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <ellipse
              cx="0"
              cy="-96"
              rx="66"
              ry="13"
              fill="#141418"
              stroke="#0a0a0e"
              strokeWidth="2.5"
            />
            <path
              d="M -64 -96 C -30 -103 30 -103 64 -96"
              fill="none"
              stroke="#32323c"
              strokeWidth="2"
            />

            <path
              d="M -36 -98 C -38 -140 -20 -148 0 -148 C 20 -148 38 -140 36 -98 Z"
              fill="#1c1c22"
              stroke="#0a0a0e"
              strokeWidth="2.5"
            />
            <path
              d="M -16 -146 C -6 -140 6 -140 16 -146"
              fill="none"
              stroke="#0e0e12"
              strokeWidth="3"
            />

            <path
              d="M -36 -104 C -18 -108 18 -108 36 -104 L 36 -98 C 18 -102 -18 -102 -36 -98 Z"
              fill="#c5ff4a"
            />

            <rect
              x="20"
              y="-105"
              width="8"
              height="8"
              rx="1.5"
              fill="#ffd700"
              stroke="#997b00"
              strokeWidth="1"
            />
            <rect x="22" y="-103" width="4" height="4" rx="0.8" fill="#141418" />
          </g>

          <g>
            <polygon points="-26,68 0,84 -2,66" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            <polygon points="26,68 0,84 2,66" fill="#ffffff" stroke="#333" strokeWidth="1.5" />

            <polygon
              points="-11,72 11,72 8,86 -8,86"
              fill="#111114"
              stroke="#060608"
              strokeWidth="1.5"
            />

            <path
              d="M -8 86 L 8 86 L 15 138 L 0 156 L -15 138 Z"
              fill="#151518"
              stroke="#08080a"
              strokeWidth="2"
            />

            <line
              x1="-10"
              y1="96"
              x2="6"
              y2="104"
              stroke="#c5ff4a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="-12"
              y1="112"
              x2="9"
              y2="122"
              stroke="#c5ff4a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="-11"
              y1="128"
              x2="11"
              y2="140"
              stroke="#c5ff4a"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <rect
              x="-6"
              y="110"
              width="16"
              height="4.5"
              rx="1.2"
              fill="#ffd700"
              stroke="#997b00"
              strokeWidth="0.8"
            />
          </g>

          <g
            style={{
              transform: `translate(${gx * 0.3}px, ${gy * 0.3}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <ellipse cx="88" cy="98" rx="30" ry="7" fill="rgba(0,0,0,0.4)" />

            <path
              d="M 76 42 C 76 30 100 30 100 42"
              fill="none"
              stroke="#222"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 76 42 C 76 30 100 30 100 42"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <rect
              x="60"
              y="42"
              width="58"
              height="46"
              rx="5"
              fill="#221e1a"
              stroke="#0e0d0b"
              strokeWidth="2.5"
            />

            <path
              d="M 60 42 L 118 42 L 116 64 L 98 71 L 80 71 L 62 64 Z"
              fill="#2e2722"
              stroke="#14110f"
              strokeWidth="1.5"
            />
            <path
              d="M 63 45 L 115 45 L 113 62 L 97 68 L 81 68 L 65 62 Z"
              fill="none"
              stroke="rgba(255,215,0,0.35)"
              strokeWidth="1"
              strokeDasharray="2.5 2"
            />

            <rect
              x="70"
              y="58"
              width="7"
              height="10"
              rx="1.5"
              fill="#ffd700"
              stroke="#997b00"
              strokeWidth="1"
            />
            <rect
              x="101"
              y="58"
              width="7"
              height="10"
              rx="1.5"
              fill="#ffd700"
              stroke="#997b00"
              strokeWidth="1"
            />

            <path d="M 60 76 L 68 88 L 60 88 Z" fill="#ffd700" />
            <path d="M 118 76 L 110 88 L 118 88 Z" fill="#ffd700" />

            <rect
              x="78"
              y="74"
              width="22"
              height="10"
              rx="2.5"
              fill="#c5ff4a"
              stroke="#060606"
              strokeWidth="1.2"
            />
            <text
              x="89"
              y="82"
              fill="#060606"
              fontSize="7"
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              PRO
            </text>
          </g>
        </g>
      )}

      {accessory === 'detective' && (
        <g id="acc-detective">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path
              d="M -58 -92 C -30 -104 30 -104 58 -92 C 40 -86 -40 -86 -58 -92 Z"
              fill="#523d2e"
              stroke="#33241a"
              strokeWidth="2"
            />

            <path
              d="M -42 -96 C -44 -142 44 -142 42 -96 Z"
              fill="#6b4c35"
              stroke="#33241a"
              strokeWidth="2.5"
            />
            <path d="M 0 -138 L 0 -96" stroke="#4a3424" strokeWidth="2" />
            <path d="M -22 -130 L -24 -96" stroke="#4a3424" strokeWidth="1.8" />
            <path d="M 22 -130 L 24 -96" stroke="#4a3424" strokeWidth="1.8" />

            <path
              d="M -12 -138 Q 0 -146 12 -138 Q 0 -132 -12 -138"
              fill="#c5ff4a"
              stroke="#060606"
              strokeWidth="1.2"
            />
          </g>

          <g
            style={{
              transform: `translate(${gx * 0.7 + 4}px, ${gy * 0.7}px)`,
              transition: 'transform 0.12s ease-out',
            }}
          >
            <path d="M 68 56 L 102 96" stroke="#523d2e" strokeWidth="10" strokeLinecap="round" />
            <line x1="78" y1="68" x2="84" y2="74" stroke="#38281d" strokeWidth="10" />
            <line x1="88" y1="80" x2="94" y2="86" stroke="#38281d" strokeWidth="10" />

            <circle cx="68" cy="56" r="6" fill="#ffd700" stroke="#997b00" strokeWidth="1.5" />

            <circle
              cx="50"
              cy="34"
              r="34"
              fill="rgba(0, 240, 255, 0.12)"
              stroke="#c5ff4a"
              strokeWidth="5"
            />

            <path
              d="M 32 18 A 26 26 0 0 1 66 14"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 42 50 A 26 26 0 0 1 28 38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>

          <g>
            <circle cx="-52" cy="62" r="12" fill="#ffd700" stroke="#b39200" strokeWidth="2" />
            <polygon
              points="-52,53 -48,58 -42,58 -46,62 -44,68 -52,64 -60,68 -58,62 -62,58 -56,58"
              fill="#060606"
            />
          </g>
        </g>
      )}

      {accessory === 'artist' && (
        <g id="acc-artist">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path
              d="M -102 -74 C -108 -118 -58 -144 -16 -134 C 20 -124 42 -106 32 -90 C 22 -76 -46 -68 -102 -74 Z"
              fill="#18181e"
              stroke="#c5ff4a"
              strokeWidth="3"
            />
            <path
              d="M -94 -90 C -62 -112 4 -104 26 -92"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2.5"
            />
            <path
              d="M -54 -140 L -54 -152"
              stroke="#c5ff4a"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>

          <g
            style={{
              transform: `translate(${gx * 0.35}px, ${gy * 0.35}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path
              d="M 54 44 C 66 28 102 32 114 48 C 126 64 120 96 108 106 C 96 116 70 114 58 100 C 48 88 46 58 54 44 Z"
              fill="#d4a373"
              stroke="#7f4f24"
              strokeWidth="2.5"
            />
            <ellipse cx="102" cy="90" rx="6" ry="8" fill="#060606" />

            <circle cx="68" cy="48" r="5.5" fill="#c5ff4a" stroke="#8cb82b" strokeWidth="1" />
            <circle cx="84" cy="44" r="5.5" fill="#ff007f" stroke="#b30059" strokeWidth="1" />
            <circle cx="100" cy="52" r="5.8" fill="#00f0ff" stroke="#0099b3" strokeWidth="1" />
            <circle cx="108" cy="68" r="5.2" fill="#ffd700" stroke="#b39700" strokeWidth="1" />
            <circle cx="72" cy="94" r="5.5" fill="#a855f7" stroke="#7122b8" strokeWidth="1" />

            <circle cx="66" cy="46" r="1.8" fill="#ffffff" opacity="0.8" />
            <circle cx="82" cy="42" r="1.8" fill="#ffffff" opacity="0.8" />
            <circle cx="98" cy="50" r="1.8" fill="#ffffff" opacity="0.8" />

            <path d="M 44 104 L 88 34" stroke="#8b5a2b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 44 104 L 40 110" stroke="#ffd700" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="39" cy="111" r="4.5" fill="#c5ff4a" />
          </g>
        </g>
      )}

      {accessory === 'professor' && (
        <g id="acc-professor">
          <g
            style={{
              transform: `translate(${gx * 0.2}px, ${gy * 0.2}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path
              d="M -30 -100 C -32 -114 32 -114 30 -100 Z"
              fill="#181820"
              stroke="#0c0c10"
              strokeWidth="2"
            />

            <polygon
              points="0,-146 54,-126 0,-106 -54,-126"
              fill="#121218"
              stroke="#c5ff4a"
              strokeWidth="2.8"
            />
            <polygon points="0,-106 54,-126 54,-122 0,-102 -54,-122 -54,-126" fill="#060608" />

            <circle cx="0" cy="-126" r="4.5" fill="#ffd700" stroke="#997b00" strokeWidth="1" />

            <path
              d="M 0 -126 Q 28 -124 38 -104"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect
              x="34"
              y="-104"
              width="8"
              height="15"
              rx="2"
              fill="#ffd700"
              stroke="#b39700"
              strokeWidth="1"
            />
            <line x1="36" y1="-89" x2="36" y2="-85" stroke="#ffd700" strokeWidth="1.5" />
            <line x1="38" y1="-89" x2="38" y2="-84" stroke="#ffd700" strokeWidth="1.5" />
            <line x1="40" y1="-89" x2="40" y2="-85" stroke="#ffd700" strokeWidth="1.5" />
          </g>

          <g>
            <text
              x="-82"
              y="-42"
              fill="#c5ff4a"
              fontSize="16"
              fontWeight="900"
              fontFamily="monospace"
              style={{ filter: 'drop-shadow(0 0 6px rgba(197,255,74,0.6))' }}
            >
              +1.2k
            </text>

            <text
              x="72"
              y="-44"
              fill="#ffd700"
              fontSize="19"
              fontWeight="900"
              fontFamily="monospace"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' }}
            >
              ∑
            </text>

            <text
              x="74"
              y="32"
              fill="#00f0ff"
              fontSize="15"
              fontWeight="900"
              fontFamily="monospace"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.6))' }}
            >
              99.9%
            </text>

            <text
              x="-78"
              y="36"
              fill="#ff007f"
              fontSize="17"
              fontWeight="bold"
              fontFamily="monospace"
            >
              ∫ dx
            </text>
          </g>
        </g>
      )}

      {accessory === 'dizzy' && (
        <g id="acc-dizzy">
          <g
            style={{
              transform: `translate(${gx * 0.3}px, ${gy * 0.3}px)`,
              transition: 'transform 0.12s ease-out',
            }}
          >
            <path
              d="M 72 -54 C 72 -68 85 -84 85 -84 C 85 -84 98 -68 98 -54 C 98 -42 87 -38 85 -38 C 83 -38 72 -42 72 -54 Z"
              fill="#00f0ff"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <ellipse cx="80" cy="-56" rx="3.5" ry="5" fill="#ffffff" opacity="0.85" />
          </g>

          <g>
            <polygon
              points="-68,-82 -63,-73 -52,-73 -60,-66 -57,-56 -68,-63 -79,-56 -76,-66 -84,-73 -73,-73"
              fill="#ffd700"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            <text
              x="-84"
              y="-24"
              fill="#c5ff4a"
              fontSize="24"
              fontWeight="900"
              fontFamily="monospace"
            >
              ?
            </text>

            <text
              x="72"
              y="-86"
              fill="#ff007f"
              fontSize="26"
              fontWeight="900"
              fontFamily="monospace"
            >
              !
            </text>

            <path
              d="M -40 -118 Q 0 -138 40 -118 Q 0 -98 -40 -118"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />
          </g>
        </g>
      )}

      {accessory === 'astronaut' && (
        <g id="acc-astronaut">
          <g>
            <path
              d="M -88 -72 C -92 -136 92 -136 88 -72"
              fill="none"
              stroke="#1a1a22"
              strokeWidth="8"
            />
            <path
              d="M -84 -74 C -88 -130 88 -130 84 -74"
              fill="none"
              stroke="#c5ff4a"
              strokeWidth="2.5"
            />

            <rect
              x="-98"
              y="-82"
              width="18"
              height="32"
              rx="6"
              fill="#262630"
              stroke="#c5ff4a"
              strokeWidth="2"
            />
            <circle cx="-89" cy="-66" r="3" fill="#c5ff4a" />

            <rect
              x="80"
              y="-82"
              width="18"
              height="32"
              rx="6"
              fill="#262630"
              stroke="#c5ff4a"
              strokeWidth="2"
            />
            <circle cx="89" cy="-66" r="3" fill="#c5ff4a" />

            <path
              d="M 88 -62 C 94 -20 66 48 30 52"
              fill="none"
              stroke="#1a1a22"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="28" cy="52" r="6" fill="#c5ff4a" stroke="#0a0a0e" strokeWidth="1.5" />
            <circle cx="27" cy="51" r="2.5" fill="#ffffff" />
          </g>
        </g>
      )}

      {accessory === 'party' && (
        <g id="acc-party">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <polygon
              points="0,-162 -36,-102 36,-102"
              fill="#0e0e14"
              stroke="#c5ff4a"
              strokeWidth="3"
            />
            <polygon points="-14,-136 14,-136 21,-123 -21,-123" fill="#c5ff4a" />
            <polygon points="-28,-111 28,-111 34,-102 -34,-102" fill="#ff007f" />
            <polygon points="-7,-150 7,-150 11,-140 -11,-140" fill="#00f0ff" />

            <circle cx="0" cy="-164" r="9" fill="#ffd700" stroke="#ffffff" strokeWidth="1.8" />
            <circle cx="-3" cy="-167" r="3" fill="#ffffff" />
            <circle cx="3" cy="-162" r="2.5" fill="#ffffff" />
          </g>

          <g>
            <rect
              x="-72"
              y="-132"
              width="7"
              height="7"
              rx="1.5"
              fill="#c5ff4a"
              transform="rotate(25 -72 -132)"
            />
            <rect
              x="66"
              y="-138"
              width="8"
              height="5"
              rx="1.5"
              fill="#ff007f"
              transform="rotate(-30 66 -138)"
            />
            <rect
              x="-95"
              y="-76"
              width="7"
              height="7"
              rx="1.5"
              fill="#ffd700"
              transform="rotate(45 -95 -76)"
            />
            <rect
              x="92"
              y="-82"
              width="8"
              height="5"
              rx="1.5"
              fill="#00f0ff"
              transform="rotate(-15 92 -82)"
            />
            <circle cx="-56" cy="-148" r="3.5" fill="#ff007f" />
            <circle cx="52" cy="-154" r="4" fill="#c5ff4a" />

            <path
              d="M -86 -110 Q -72 -98 -80 -86"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M 80 -116 Q 92 -104 82 -92"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}

      {accessory === 'developer' && (
        <g id="acc-developer">
          <g
            style={{
              transform: `translate(${gx * 0.25}px, ${gy * 0.25}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path
              d="M -62 -78 C -22 -88 22 -88 62 -78 L 60 -68 C 20 -78 -20 -78 -60 -68 Z"
              fill="#181820"
              stroke="#c5ff4a"
              strokeWidth="2"
            />
            <line
              x1="-48"
              y1="-74"
              x2="-20"
              y2="-74"
              stroke="#c5ff4a"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <line
              x1="20"
              y1="-74"
              x2="48"
              y2="-74"
              stroke="#c5ff4a"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />

            <path d="M 44 -74 L 62 -118" stroke="#2a2a35" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 44 -74 L 62 -118" stroke="#c5ff4a" strokeWidth="1.2" strokeLinecap="round" />
            <circle
              cx="63"
              cy="-120"
              r="6.5"
              fill="#c5ff4a"
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 6px rgba(197,255,74,0.9))' }}
            />
            <circle cx="62" cy="-121" r="2" fill="#ffffff" />
          </g>

          <g
            style={{
              transform: `translate(${gx * 0.4 + 4}px, ${gy * 0.4}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <rect
              x="62"
              y="-46"
              width="78"
              height="52"
              rx="4"
              fill="rgba(8, 8, 12, 0.88)"
              stroke="#c5ff4a"
              strokeWidth="1.8"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
            />

            <rect x="62" y="-46" width="78" height="12" rx="4" fill="#181822" />
            <circle cx="69" cy="-40" r="2.2" fill="#ff5f56" />
            <circle cx="75" cy="-40" r="2.2" fill="#ffbd2e" />
            <circle cx="81" cy="-40" r="2.2" fill="#27c93f" />

            <text
              x="68"
              y="-24"
              fill="#c5ff4a"
              fontSize="6.8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              &gt;_ git push
            </text>
            <text x="68" y="-12" fill="#ffffff" fontSize="6.2" fontFamily="monospace" opacity="0.9">
              ✓ live [SVG]
            </text>

            <rect x="114" y="-17" width="4" height="6" fill="#c5ff4a" opacity="0.8" />
          </g>
        </g>
      )}
    </g>
  )
})
