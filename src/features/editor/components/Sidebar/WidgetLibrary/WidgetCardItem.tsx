'use client'

import React from 'react'

import { WIDGET_CATEGORIES, WIDGET_IDS } from '@/constants'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { CodewebCardItem } from './CodewebCardItem'
import { DefaultWidgetCardItem } from './DefaultWidgetCardItem'
import { GitFestCardItem } from './GitFestCardItem'
import { GitFutCardItem } from './GitFutCardItem'
import { PokemonCardItem } from './PokemonCardItem'

interface WidgetCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function WidgetCardItem({ item, onAdd, onHover, onLeave }: WidgetCardItemProps) {
  if (item.id === WIDGET_IDS.GITFEST_LINEUP) {
    return <GitFestCardItem item={item} onAdd={onAdd} onHover={onHover} onLeave={onLeave} />
  }

  if (item.id === WIDGET_IDS.POKEMON_CARD) {
    return <PokemonCardItem item={item} onAdd={onAdd} onHover={onHover} onLeave={onLeave} />
  }

  if (item.id === WIDGET_IDS.GITFUT_CARD) {
    return <GitFutCardItem item={item} onAdd={onAdd} onHover={onHover} onLeave={onLeave} />
  }

  if (item.category === WIDGET_CATEGORIES.CODEWEB_DEV) {
    return <CodewebCardItem item={item} onAdd={onAdd} onHover={onHover} onLeave={onLeave} />
  }

  return <DefaultWidgetCardItem item={item} onAdd={onAdd} onHover={onHover} onLeave={onLeave} />
}
