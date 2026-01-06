/**
 * Dynamiczny OpenGraph Image dla strony głównej
 *
 * Generuje obraz 1200x630px dla udostępniania w social media.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'LowCarbPlaner - Planowanie diety niskowęglowodanowej'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '24px',
            fontSize: '48px',
          }}
        >
          🥗
        </div>
        <span
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
          }}
        >
          LowCarbPlaner
        </span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: '64px',
          fontWeight: 700,
          color: 'white',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: 1.2,
          maxWidth: '900px',
        }}
      >
        Planuj dietę niskowęglowodanową
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '28px',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          maxWidth: '800px',
          lineHeight: 1.4,
        }}
      >
        Automatyczne planowanie posiłków • Przepisy keto • Kalkulator kalorii
      </p>

      {/* Features badges */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '48px',
        }}
      >
        {['Darmowe', '100+ przepisów', 'Kalkulator BMR'].map((badge) => (
          <div
            key={badge}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '12px 24px',
              borderRadius: '30px',
              color: 'white',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            {badge}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  )
}
