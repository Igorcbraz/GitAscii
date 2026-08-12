import { ImageResponse } from 'next/og'

import { APP_DOMAIN } from '@/constants'

export const runtime = 'edge'

export const alt = 'GitAscii — Turn your GitHub profile into ASCII art'
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
        backgroundColor: '#060606',
        backgroundImage: 'radial-gradient(ellipse at 40% 50%, #0d1a07 0%, #060606 65%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 44,
          left: 60,
          display: 'flex',
          alignItems: 'baseline',
          gap: '0px',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 400, color: '#ffffff', fontFamily: 'serif' }}>
          Git
        </span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#c5ff4a',
            fontFamily: 'serif',
          }}
        >
          Ascii
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '640px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '60px',
          paddingRight: '40px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#7a7a8a',
            marginBottom: 24,
            fontFamily: 'sans-serif',
          }}
        >
          [ YOUR GITHUB PROFILE · TRANSFORMED ]
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontSize: 62,
              fontWeight: 300,
              lineHeight: 0.94,
              color: '#ffffff',
              fontFamily: 'serif',
              letterSpacing: '-1.5px',
            }}
          >
            Turn your GitHub
          </span>
          <span
            style={{
              fontSize: 62,
              fontWeight: 300,
              lineHeight: 0.94,
              color: '#ffffff',
              fontFamily: 'serif',
              letterSpacing: '-1.5px',
              marginTop: 6,
            }}
          >
            profile into{' '}
            <span
              style={{
                color: '#c5ff4a',
                fontStyle: 'italic',
              }}
            >
              ASCII art.
            </span>
          </span>
        </div>

        <div
          style={{
            fontSize: 16,
            color: '#c5c5c5',
            lineHeight: 1.55,
            fontFamily: 'sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          Live SVG Stats Widgets · Custom ASCII Art Engine · Drag &amp; Drop Editor
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 60,
          transform: 'translateY(-50%)',
          width: '420px',
          height: '320px',
          backgroundColor: '#1f1f1f',
          border: '1px solid #252525',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: 16,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3d3d3d' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3d3d3d' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3d3d3d' }} />
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: '#525252',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            ascii-engine · output.txt
          </span>
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 10.5,
            lineHeight: 1.18,
            color: '#c5ff4a',
            letterSpacing: '0.06em',
            whiteSpace: 'pre',
          }}
        >
          {`  .  ##::@@@@::##  .
  .#@@@@@@@@@@@@@@#.
  :@@@@========@@@@:
  @@@@==  .  . ==@@@
  @@@@==  O  O ==@@@
  @@@@==    .   =@@@@
  :@@@@==-----[@@@@:
  .#@@@@@@@@@@@@@@@@.
    ...::@@@@::...
  .:::@@@@@@@@@@@@:.
  :@@@@=======@@@@@:
  @@@@==@======@@@@
  :@@@@=======@@@@@:
  ..::@@@@@@@@::..`}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: '#c5ff4a',
              border: '1px solid #c5ff4a',
              padding: '3px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.06em',
              fontFamily: 'monospace',
            }}
          >
            &gt; RENDERED
          </span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: '#c5ff4a',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#121212',
          border: '1px solid #272727',
          padding: '10px 24px',
          borderRadius: '4px',
        }}
      >
        <span
          style={{
            color: '#c5ff4a',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          ${APP_DOMAIN}
        </span>
        <span style={{ color: '#3d3d3d', fontSize: 14 }}>|</span>
        <span
          style={{
            color: '#7a7a8a',
            fontSize: 14,
            fontFamily: 'sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          100% Free &amp; Open Source
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
