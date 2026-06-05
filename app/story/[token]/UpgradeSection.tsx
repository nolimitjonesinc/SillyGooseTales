'use client'

import { useState } from 'react'

interface UpgradeSectionProps {
  childName: string
  subscriberId: string
}

export function UpgradeSection({ childName, subscriberId }: UpgradeSectionProps) {
  const [loading, setLoading] = useState<'annual' | 'monthly' | null>(null)

  async function handleUpgrade(plan: 'annual' | 'monthly') {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, subscriberId })
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="no-print" style={{
      marginTop: '64px',
      paddingTop: '64px',
      borderTop: '1px solid #f0ebe0',
      textAlign: 'center'
    }}>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#2C2A26',
        margin: '0 0 8px 0',
        fontWeight: 'normal'
      }}>
        {childName} loved this one.
      </p>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: '#888888',
        margin: '0 0 48px 0'
      }}>
        There&apos;s a new story waiting every day.
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap' as const
      }}>
        {/* Annual — dominant */}
        <div style={{
          border: '2px solid #E8A838',
          borderRadius: '12px',
          padding: '28px 32px',
          width: '220px',
          boxShadow: '0 0 0 4px rgba(232, 168, 56, 0.1)',
          textAlign: 'center' as const
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#E8A838',
            margin: '0 0 8px 0',
            fontWeight: 'bold'
          }}>
            Best value
          </p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2C2A26',
            margin: '0 0 4px 0'
          }}>
            $89.99
          </p>
          <p style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            color: '#888888',
            margin: '0 0 4px 0'
          }}>
            per year
          </p>
          <p style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#aaaaaa',
            margin: '0 0 24px 0'
          }}>
            $7.50/month
          </p>
          <button
            onClick={() => handleUpgrade('annual')}
            disabled={loading !== null}
            style={{
              backgroundColor: '#E8A838',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '15px',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              cursor: loading !== null ? 'wait' : 'pointer',
              width: '100%'
            }}
          >
            {loading === 'annual' ? 'Loading...' : 'Start Weekly Stories'}
          </button>
        </div>

        {/* Monthly — secondary */}
        <div style={{
          border: '1px solid #e0dbd0',
          borderRadius: '12px',
          padding: '28px 32px',
          width: '220px',
          textAlign: 'center' as const
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#aaaaaa',
            margin: '0 0 8px 0',
          }}>
            Monthly
          </p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2C2A26',
            margin: '0 0 4px 0'
          }}>
            $9.99
          </p>
          <p style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            color: '#888888',
            margin: '0 0 4px 0'
          }}>
            per month
          </p>
          <p style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#aaaaaa',
            margin: '0 0 24px 0'
          }}>
            Cancel anytime
          </p>
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={loading !== null}
            style={{
              backgroundColor: 'transparent',
              color: '#2C2A26',
              border: '1px solid #2C2A26',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '15px',
              fontFamily: 'Georgia, serif',
              cursor: loading !== null ? 'wait' : 'pointer',
              width: '100%'
            }}
          >
            {loading === 'monthly' ? 'Loading...' : 'Start Weekly Stories'}
          </button>
        </div>
      </div>

      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#cccccc',
        marginTop: '24px'
      }}>
        No app. No logins. Just a story in your inbox, every day.
      </p>
    </div>
  )
}
