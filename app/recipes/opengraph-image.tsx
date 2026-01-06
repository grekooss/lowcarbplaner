/**
 * Dynamiczny OpenGraph Image dla strony przepisów
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Przepisy niskowęglowodanowe - LowCarbPlaner'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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
          🍳
        </div>
        <span
          style={{
            fontSize: '48px',
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
          fontSize: '72px',
          fontWeight: 700,
          color: 'white',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: 1.2,
        }}
      >
        Przepisy Keto i Low-Carb
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
        Setki sprawdzonych przepisów niskowęglowodanowych z dokładnymi
        wartościami odżywczymi
      </p>

      {/* Meal type badges */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '48px',
        }}
      >
        {['Śniadania', 'Obiady', 'Kolacje', 'Przekąski'].map((badge) => (
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
