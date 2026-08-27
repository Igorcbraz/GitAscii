import { RefreshCw, RotateCcw, Search, Sparkles } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import { renderPokemonCard } from '../../../widgets/renderers/PokemonCardRenderer'
import { useEditorStore } from '../../store/editorStore'

const SUGGESTED_POKEMON = [
  'Charizard',
  'Pikachu',
  'Mewtwo',
  'Gengar',
  'Lugia',
  'Rayquaza',
  'Snorlax',
  'Gyarados',
  'Dragonite',
  'Eevee',
  'Umbreon',
  'Lucario',
]

const POPULAR_SETS = [
  'base1',
  'base2',
  'base3',
  'base4',
  'base5',
  'gym1',
  'gym2',
  'neo1',
  'neo2',
  'neo3',
  'neo4',
  'ex1',
  'ex2',
  'ex3',
  'dp1',
  'dp2',
  'pl1',
  'hgss1',
  'bw1',
  'bw2',
  'xy1',
  'xy2',
  'sm1',
  'sm2',
  'swsh1',
  'swsh2',
  'sv1',
  'sv2',
  'sv9',
]

interface UnifiedPokemonCard {
  id: string
  name: string
  image: string
}

let cachedPokemonTcgCards: UnifiedPokemonCard[] | null = null

async function searchPokemonCards(query: string): Promise<UnifiedPokemonCard[]> {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  // 1. Try TCGdex API first
  try {
    const res = await fetch(API_ENDPOINTS.TCGDEX.CARDS_BY_NAME(cleanQuery), {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json)) {
        const valid = json
          .filter((c: any) => c.image)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            image: `${c.image}/low.webp`,
          }))
        if (valid.length > 0) {
          return valid
        }
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback to PokemonTCG open dataset via jsDelivr CDN
  try {
    if (!cachedPokemonTcgCards) {
      const allResults = await Promise.allSettled(
        POPULAR_SETS.map((setId) =>
          fetch(API_ENDPOINTS.POKEMON_TCG.SET_CARDS(setId), {
            signal: AbortSignal.timeout(4000),
          }).then((r) => (r.ok ? r.json() : []))
        )
      )

      const cards: UnifiedPokemonCard[] = []
      for (const result of allResults) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          for (const card of result.value) {
            const imgUrl = card.images?.small || card.images?.large
            if (imgUrl) {
              cards.push({
                id: card.id,
                name: card.name,
                image: imgUrl,
              })
            }
          }
        }
      }
      if (cards.length > 0) {
        cachedPokemonTcgCards = cards
      }
    }

    if (cachedPokemonTcgCards && cachedPokemonTcgCards.length > 0) {
      return cachedPokemonTcgCards.filter((c) => c.name.toLowerCase().includes(cleanQuery))
    }
  } catch (err) {
    console.warn('Fallback Pokemon TCG fetch failed:', err)
  }

  return []
}

function isTcgdexHost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)
    return (
      parsed.hostname === 'assets.tcgdex.net' ||
      parsed.hostname === 'tcgdex.net' ||
      parsed.hostname.endsWith('.tcgdex.net')
    )
  } catch {
    return false
  }
}

async function fetchCardAsDataUri(cardImageUrl: string): Promise<string> {
  const isTcgdex = isTcgdexHost(cardImageUrl)
  const targetUrl =
    isTcgdex && !cardImageUrl.endsWith('.webp') ? `${cardImageUrl}/low.webp` : cardImageUrl

  try {
    const res = await fetch(targetUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read blob as data URL'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('Could not convert Pokemon card image to data URI:', err)
    return targetUrl
  }
}

export function PokemonCardControls({ instanceId, config }: { instanceId: string; config: any }) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)

  const [searchQuery, setSearchQuery] = useState((config.searchQuery as string) || '')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<UnifiedPokemonCard[]>((config.searchCards as any[]) || [])
  const enableHolo = config.enableHolo !== false

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const suggestionsScrollRef = useRef<HTMLDivElement>(null)
  const [isDraggingSuggestions, setIsDraggingSuggestions] = useState(false)
  const [startSuggestionsX, setStartSuggestionsX] = useState(0)
  const [scrollSuggestionsLeft, setScrollSuggestionsLeft] = useState(0)

  const [rotateX, setRotateX] = useState(Number(config.rotateX) || 0)
  const [rotateY, setRotateY] = useState(Number(config.rotateY) || 0)
  const [glareX, setGlareX] = useState(Number(config.glareX) || 50)
  const [glareY, setGlareY] = useState(Number(config.glareY) || 50)
  const [shineX, setShineX] = useState(Number(config.shineX) || 50)
  const [shineY, setShineY] = useState(Number(config.shineY) || 50)

  const [error, setError] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRandom = async () => {
      if (
        !config.imageUrl &&
        !config.searchQuery &&
        (!config.searchCards || config.searchCards.length === 0)
      ) {
        try {
          setError(null)
          const randomName = SUGGESTED_POKEMON[Math.floor(Math.random() * SUGGESTED_POKEMON.length)]
          setSearchQuery(randomName)

          const validCards = await searchPokemonCards(randomName)
          if (validCards.length > 0) {
            const randomCardIndex = Math.floor(Math.random() * Math.min(validCards.length, 5))
            const card = validCards[randomCardIndex]

            const newCards = validCards.slice(0, 20)
            setCards(newCards)
            const cardDataUri = await fetchCardAsDataUri(card.image)
            updateWidgetConfig(instanceId, {
              searchQuery: randomName,
              searchCards: newCards,
              imageUrl: cardDataUri,
              cardRawUrl: card.image,
            })
          }
        } catch (err) {
          console.warn('Unable to load initial random Pokemon card:', err)
          setError(
            t(
              'errors.pokemon_service_unavailable',
              'Serviço de cartas indisponível no momento. Tente novamente mais tarde.'
            )
          )
        }
      }
    }
    fetchRandom()
  }, [config.imageUrl, config.searchQuery, config.searchCards, instanceId, updateWidgetConfig, t])

  const handleSearch = async (queryToSearch?: string) => {
    const query = typeof queryToSearch === 'string' ? queryToSearch : searchQuery
    if (!query) return
    setLoading(true)
    setError(null)
    try {
      const validCards = await searchPokemonCards(query)
      const newCards = validCards.slice(0, 20)
      setCards(newCards)
      updateWidgetConfig(instanceId, { searchQuery: query, searchCards: newCards })
      if (newCards.length === 0) {
        setError(t('errors.pokemon_no_cards', 'Nenhuma carta encontrada para esta busca.'))
      }
    } catch (err) {
      console.warn('Error fetching Pokemon cards:', err)
      setError(
        t(
          'errors.pokemon_service_unavailable',
          'Serviço de cartas indisponível no momento. Tente novamente mais tarde.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const selectCard = async (card: UnifiedPokemonCard) => {
    if (card.image) {
      updateWidgetConfig(instanceId, {
        imageUrl: card.image,
        cardRawUrl: card.image,
      })
      const dataUri = await fetchCardAsDataUri(card.image)
      if (dataUri) {
        updateWidgetConfig(instanceId, { imageUrl: dataUri, cardRawUrl: card.image })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rx = -((y - centerY) / centerY) * 15
    const ry = ((x - centerX) / centerX) * 15

    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100

    setRotateX(rx)
    setRotateY(ry)
    setGlareX(px)
    setGlareY(py)
    setShineX(100 - px)
    setShineY(100 - py)
  }

  const handleMouseLeave = () => {
    setRotateX(Number(config.rotateX) || 0)
    setRotateY(Number(config.rotateY) || 0)
    setGlareX(Number(config.glareX) || 50)
    setGlareY(Number(config.glareY) || 50)
    setShineX(Number(config.shineX) || 50)
    setShineY(Number(config.shineY) || 50)
  }

  const resetVisualState = () => {
    setRotateX(0)
    setRotateY(0)
    setGlareX(50)
    setGlareY(50)
    setShineX(50)
    setShineY(50)
    updateWidgetConfig(instanceId, {
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      shineX: 50,
      shineY: 50,
      intensity: 1,
      scale: 1,
    })
  }

  const saveVisualState = () => {
    updateWidgetConfig(instanceId, {
      rotateX,
      rotateY,
      glareX,
      glareY,
      shineX,
      shineY,
      intensity: 1,
      scale: 1,
    })
  }

  const imageUrl = config.imageUrl || ''

  return (
    <div className="space-y-4 pt-4 border-t border-graphite">
      <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <Search size={14} />
        <span>{t('editor.pokemon.search_title', 'Buscar Carta Pokémon')}</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            updateWidgetConfig(instanceId, { searchQuery: e.target.value })
          }}
          placeholder={t('editor.pokemon.search_placeholder', 'Ex: Charizard') as string}
          className="flex-1 bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={() => handleSearch()}
          className="bg-signal-lime text-black px-3 py-1.5 rounded-xs font-medium hover:opacity-90 cursor-pointer"
          disabled={loading}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      <div
        ref={suggestionsScrollRef}
        onMouseDown={(e) => {
          setIsDraggingSuggestions(true)
          if (suggestionsScrollRef.current) {
            setStartSuggestionsX(e.pageX - suggestionsScrollRef.current.offsetLeft)
            setScrollSuggestionsLeft(suggestionsScrollRef.current.scrollLeft)
          }
        }}
        onMouseLeave={() => setIsDraggingSuggestions(false)}
        onMouseUp={() => setIsDraggingSuggestions(false)}
        onMouseMove={(e) => {
          if (!isDraggingSuggestions) return
          e.preventDefault()
          if (suggestionsScrollRef.current) {
            const x = e.pageX - suggestionsScrollRef.current.offsetLeft
            const walk = (x - startSuggestionsX) * 2
            suggestionsScrollRef.current.scrollLeft = scrollSuggestionsLeft - walk
          }
        }}
        className={`flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none ${isDraggingSuggestions ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {SUGGESTED_POKEMON.map((name) => (
          <button
            key={name}
            onClick={() => {
              if (!isDraggingSuggestions) {
                setSearchQuery(name)
                handleSearch(name)
              }
            }}
            className="shrink-0 px-2 py-1 text-eyebrow bg-graphite border border-graphite text-ash rounded-xs hover:border-signal-lime hover:text-signal-lime transition-colors"
          >
            {name}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-note text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xs font-inter-tight">
          {error}
        </div>
      )}

      {cards.length > 0 && (
        <div
          ref={scrollRef}
          onMouseDown={(e) => {
            setIsDragging(true)
            if (scrollRef.current) {
              setStartX(e.pageX - scrollRef.current.offsetLeft)
              setScrollLeft(scrollRef.current.scrollLeft)
            }
          }}
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={(e) => {
            if (!isDragging) return
            e.preventDefault()
            if (scrollRef.current) {
              const x = e.pageX - scrollRef.current.offsetLeft
              const walk = (x - startX) * 2
              scrollRef.current.scrollLeft = scrollLeft - walk
            }
          }}
          className={`flex gap-3 overflow-x-auto pb-2 custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          {cards.map((c: any) => (
            <div
              key={c.id}
              onClick={() => {
                if (!isDragging) selectCard(c)
              }}
              className="w-24 h-36 shrink-0 hover:ring-2 hover:ring-signal-lime rounded-xs overflow-hidden bg-graphite transition-transform hover:scale-[1.02]"
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name || 'Pokemon card'}
                  width={96}
                  height={144}
                  className="w-full h-full object-cover pointer-events-none"
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      )}

      {imageUrl && !loading && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between p-2 bg-graphite rounded-xs border border-graphite">
            <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
              <Sparkles size={13} className="text-signal-lime" />
              {t('editor.pokemon.holo_effect', 'Efeito Holográfico')}
            </label>
            <Switch
              checked={enableHolo}
              onChange={(checked) => updateWidgetConfig(instanceId, { enableHolo: checked })}
            />
          </div>

          <div className="flex items-center justify-between text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <span>{t('editor.pokemon.interactive_preview', 'Pré-visualização Interativa')}</span>
            <button
              onClick={resetVisualState}
              className="flex items-center gap-1 text-signal-lime hover:underline cursor-pointer"
            >
              <RotateCcw size={12} /> {t('editor.pokemon.reset', 'Resetar')}
            </button>
          </div>

          <div className="flex justify-center">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={saveVisualState}
              className="relative w-62.5 h-87.5 cursor-crosshair"
            >
              <svg
                width="250"
                height="350"
                viewBox="0 0 250 350"
                style={{ overflow: 'visible' }}
                dangerouslySetInnerHTML={{
                  __html: renderPokemonCard(
                    {
                      instanceId: instanceId + '-preview',
                      config: {
                        ...config,
                        enableHolo,
                        imageUrl,
                        rotateX,
                        rotateY,
                        glareX,
                        glareY,
                        shineX,
                        shineY,
                      },
                    } as any,
                    {} as any,
                    {} as any,
                    250,
                    350
                  ),
                }}
              />
            </div>
          </div>

          <p className="text-caption text-ash text-center">
            {t(
              'editor.pokemon.instruction_start',
              'Passe o mouse sobre a carta para ajustar o ângulo e '
            )}
            <strong>{t('editor.pokemon.instruction_click', 'CLIQUE')}</strong>
            {t('editor.pokemon.instruction_end', ' nela para salvar a posição.')}
          </p>
        </div>
      )}

      {loading && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <span>{t('editor.pokemon.extracting', 'Extraindo Dados...')}</span>
          </div>

          <div className="flex justify-center">
            <div className="relative w-62.5 h-87.5">
              <svg
                width="250"
                height="350"
                viewBox="0 0 250 350"
                style={{ overflow: 'visible' }}
                dangerouslySetInnerHTML={{
                  __html: renderPokemonCard(
                    {
                      instanceId: instanceId + '-loading',
                      config: { ...config, isLoading: true },
                    } as any,
                    {} as any,
                    {} as any,
                    250,
                    350
                  ),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
