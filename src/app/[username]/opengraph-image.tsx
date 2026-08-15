/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

import { APP_URL } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

export const runtime = 'edge'

export const alt = 'GitAscii — GitHub Profile README & ASCII Art Generator'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const cleanUsername = username || 'Developer'
  const avatarUrl = API_ENDPOINTS.GITHUB.AVATAR(cleanUsername)

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#060606',
        backgroundImage:
          'radial-gradient(circle at 50% 30%, #17240d 0%, #060606 70%), linear-gradient(180deg, rgba(197,255,74,0.05) 0%, transparent 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        position: 'relative',
        padding: '48px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: '#ffffff' }}>Git</span>
        <span style={{ fontSize: 26, fontWeight: 300, fontStyle: 'italic', color: '#c5ff4a' }}>
          Ascii
        </span>
        <span
          style={{
            fontSize: 14,
            backgroundColor: 'rgba(197, 255, 74, 0.15)',
            border: '1px solid rgba(197, 255, 74, 0.4)',
            color: '#c5ff4a',
            padding: '2px 10px',
            borderRadius: '12px',
            marginLeft: '8px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Profile Card
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#121212',
          border: '1px solid #282828',
          borderRadius: '8px',
          padding: '36px 48px',
          width: '90%',
          maxWidth: '1000px',
          gap: '36px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(197,255,74,0.1)',
        }}
      >
        <img
          src={avatarUrl}
          alt={cleanUsername}
          style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '3px solid #c5ff4a',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 16, color: '#888888', letterSpacing: '0.15em', marginBottom: 4 }}>
            GITHUB PROFILE README
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            @{cleanUsername}
          </div>
          <div style={{ fontSize: 18, color: '#c5ff4a', marginTop: 8 }}>
            Live SVG Widgets · ASCII Art Engine · Custom Themes
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: 20 }}>
            <div
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: 14,
                color: '#cccccc',
              }}
            >
              Terminal Template
            </div>
            <div
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: 14,
                color: '#cccccc',
              }}
            >
              Live Stats & Streaks
            </div>
            <div
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: 14,
                color: '#cccccc',
              }}
            >
              Dark / Light Mode
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: 15,
          color: '#777777',
        }}
      >
        <span>
          {APP_URL}/{cleanUsername}
        </span>
        <span>•</span>
        <span style={{ color: '#c5ff4a' }}>Free GitHub Profile Generator</span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
