'use client'

import Script from 'next/script'
import { createElement } from 'react'

declare global {
  interface Window {
    clarity?: (...args: any[]) => void
  }
}

interface MicrosoftClarityProps {
  consentGranted: boolean
}

export function MicrosoftClarity({ consentGranted }: MicrosoftClarityProps) {
  const isProduction = process.env.NODE_ENV === 'production'
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

  if (!isProduction || !projectId || !consentGranted) return null

  return createElement(Script, {
    id: 'microsoft-clarity',
    strategy: 'afterInteractive',
    dangerouslySetInnerHTML: {
      __html: `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
        window.clarity("consent");
      `,
    },
  })
}

const PII_KEYWORDS = ['email', 'name', 'password', 'token', 'cpf', 'phone', 'secret']

function containsPII(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return PII_KEYWORDS.some((keyword) => lowerKey.includes(keyword))
}

export function trackClarityEvent(eventName: string) {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName)
  }
}

export function setClarityTag(key: string, value: string | number | boolean) {
  if (typeof window !== 'undefined' && window.clarity) {
    if (typeof value === 'string' && containsPII(key)) {
      console.warn(`[Clarity] Tag '${key}' bloqueada para prevenir rastreamento de PII.`)
      return
    }
    window.clarity('set', key, value.toString())
  }
}
