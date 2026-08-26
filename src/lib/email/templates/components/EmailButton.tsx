import { Button } from '@react-email/components'
import React from 'react'

interface EmailButtonProps {
  href: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function EmailButton({ href, children, variant = 'primary' }: EmailButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <Button
      href={href}
      style={{
        backgroundColor: isPrimary ? '#c5ff4a' : '#27272a',
        color: isPrimary ? '#000000' : '#f4f4f5',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        border: isPrimary ? '1px solid #c5ff4a' : '1px solid #3f3f46',
        letterSpacing: '-0.2px',
      }}
    >
      {children}
    </Button>
  )
}
