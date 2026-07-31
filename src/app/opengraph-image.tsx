import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GitAscii — Premium GitHub Profile README & ASCII Art Generator'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
        backgroundImage: 'radial-gradient(ellipse at center, #1a2310 0%, #060606 70%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        position: 'relative',
        padding: '60px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>Git</span>
        <span style={{ fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: '#c5ff4a' }}>
          Ascii
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '1000px',
        }}
      >
        <div
          style={{
            fontSize: 16,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#888888',
            marginBottom: 20,
          }}
        >
          [ THE FUTURE OF GITHUB PROFILES ]
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Create <span style={{ color: '#c5ff4a', fontStyle: 'italic' }}>Stunning</span> GitHub
          Profile READMEs
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#cccccc',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Live SVG Stats Widgets · Custom ASCII Art Engine · Drag & Drop Visual Editor
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          backgroundColor: '#121212',
          border: '1px solid #272727',
          padding: '12px 24px',
          borderRadius: '4px',
        }}
      >
        <span style={{ color: '#c5ff4a', fontSize: 16, fontWeight: 600 }}>
          git-ascii.vercel.app
        </span>
        <span style={{ color: '#555555' }}>|</span>
        <span style={{ color: '#888888', fontSize: 16 }}>100% Free & Open Source</span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
