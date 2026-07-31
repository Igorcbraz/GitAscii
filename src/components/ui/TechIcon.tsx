import React from 'react'

interface TechIconProps {
  name: string
  className?: string
}

export function TechIcon({ name, className = 'size-4' }: TechIconProps) {
  const iconName = name.toLowerCase()

  switch (iconName) {
    case 'react':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
        </svg>
      )
    case 'nextjs':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9 8v8l8-9.5V16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'python':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M11.9 2c-4.4 0-4.1 1.9-4.1 1.9v2h4.2v.6H6.1s-2.9.3-2.9 4.3c0 4 2.5 4.1 2.5 4.1h1.5v-2.1s-.1-2.5 2.5-2.5h4.2s2.4 0 2.4-2.3V4.3S16.6 2 11.9 2zm-1.3 1.3a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zM12.1 22c4.4 0 4.1-1.9 4.1-1.9v-2h-4.2v-.6h5.9s2.9-.3 2.9-4.3c0-4-2.5-4.1-2.5-4.1h-1.5v2.1s.1 2.5-2.5 2.5h-4.2s-2.4 0-2.4 2.3v3.7s-.3 2.3 4.4 2.3zm1.3-1.3a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z" />
        </svg>
      )
    case 'node':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <path d="M12 2l8.5 4.9v9.8L12 21.5l-8.5-4.8V6.9L12 2z" strokeLinejoin="round" />
          <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        </svg>
      )
    case 'go':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <path d="M4 12h8m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="12" r="3" />
        </svg>
      )
    case 'rust':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v3m0 10v3m-8-8h3m10 0h3" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
  }
}
