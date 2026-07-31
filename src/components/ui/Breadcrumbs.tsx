'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { t } = useI18n()

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-note font-inter-tight text-ash ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 hover:text-signal-lime transition-colors duration-200"
      >
        <Home className="size-3.5" />
        <span className="font-jetbrains-mono text-caption uppercase tracking-wider">
          {t('common.home', 'Home')}
        </span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            <ChevronRight className="size-3.5 text-graphite shrink-0" />
            {isLast || !item.href ? (
              <span className="font-jetbrains-mono text-caption uppercase tracking-wider text-signal-lime font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="font-jetbrains-mono text-caption uppercase tracking-wider hover:text-signal-lime transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
