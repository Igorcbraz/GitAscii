'use client'

import { motion } from 'motion/react'
import React, { useId, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

type FeatureType = {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

type FeatureCardProps = React.ComponentProps<typeof motion.div> & {
  feature: FeatureType
  index?: number
}

export function FeatureCard({ feature, index, className, ...props }: FeatureCardProps) {
  const p = useMemo(() => genDeterministicPattern(feature.title), [feature.title])
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const formattedIndex = index !== undefined ? `// 0${index + 1}` : ''

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
      onMouseMove={handleMouseMove}
      className={cn(
        'bg-onyx border border-graphite rounded-none transition-colors duration-300 group relative overflow-hidden p-8 flex flex-col cursor-default select-none min-h-62.5',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300">
        <div className="absolute inset-0 bg-linear-to-r from-white/5 to-transparent mask-[radial-gradient(farthest-side_at_top,white,transparent)]" />
        <GridPattern
          width={20}
          height={20}
          x="-12"
          y="4"
          squares={p}
          className="fill-white/5 stroke-graphite/40 absolute inset-0 h-full w-full mix-blend-overlay"
        />
      </div>

      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(197, 255, 74, 0.06), transparent 80%)`,
        }}
      />

      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 border border-signal-lime/25"
        style={{
          maskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
        }}
      />

      <div className="absolute top-2 left-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/20 transition-colors duration-300">
        +
      </div>
      <div className="absolute top-2 right-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/20 transition-colors duration-300">
        +
      </div>
      <div className="absolute bottom-2 left-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/20 transition-colors duration-300">
        +
      </div>
      <div className="absolute bottom-2 right-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/20 transition-colors duration-300">
        +
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between grow">
        <div>
          <div className="flex justify-between items-start">
            <div className="p-2 border border-graphite bg-carbon/50 group-hover:border-signal-lime/30 group-hover:bg-carbon transition-colors duration-300">
              <feature.icon
                className="text-ash group-hover:text-signal-lime size-6 transition-all duration-300 group-hover:scale-110"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <span className="font-mono text-caption text-ash/30 group-hover:text-signal-lime/50 transition-colors duration-300 mt-1">
              {formattedIndex}
            </span>
          </div>

          <h3 className="mt-8 font-inter-tight font-medium text-subheading text-chalk tracking-tight group-hover:text-white transition-colors duration-200">
            {feature.title}
          </h3>

          <p className="font-inter-tight font-normal text-body text-bone leading-body mt-3">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<'svg'> & {
  width: number
  height: number
  x: string
  y: string
  squares?: number[][]
}) {
  const patternId = useId()

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}

function genDeterministicPattern(seedStr: string, length = 5): number[][] {
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash)
  }

  const result: number[][] = []
  for (let i = 0; i < length; i++) {
    hash = (hash * 1664525 + 1013904223) % 4294967296
    const randX = (Math.abs(hash) % 4) + 7 // x between 7 and 10
    hash = (hash * 1664525 + 1013904223) % 4294967296
    const randY = (Math.abs(hash) % 6) + 1 // y between 1 and 6
    result.push([randX, randY])
  }
  return result
}
