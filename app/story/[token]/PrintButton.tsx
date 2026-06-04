'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: 'none',
        border: '1px solid #e0dbd0',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        color: '#aaaaaa',
        cursor: 'pointer',
        fontFamily: 'Georgia, serif',
        letterSpacing: '0.05em'
      }}
    >
      Save as PDF
    </button>
  )
}
