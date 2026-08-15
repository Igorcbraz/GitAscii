/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

import { APP_URL } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

export const runtime = 'edge'

export const alt = 'GitAscii — Named Profile Layout Card'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; profile: string }>
}) {
  const { username, profile } = await params
  const cleanUsername = username || 'Developer'
  const cleanProfile = profile || 'Layout'
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
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '3px solid #c5ff4a',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 14, color: '#888888', letterSpacing: '0.15em', marginBottom: 4 }}>
            CUSTOM PROFILE LAYOUT
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            @{cleanUsername} / {cleanProfile}
          </div>
          <div style={{ fontSize: 18, color: '#c5ff4a', marginTop: 8 }}>
            Dynamic SVG Widget Endpoint · Live GitHub Stats
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
          ${APP_URL}/{cleanUsername}/{cleanProfile}
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
