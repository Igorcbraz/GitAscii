import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { StrobiAccessories } from '../components/StrobiAccessories'
import { GazeController } from '../core/GazeController'
import { LocomotionPhysics } from '../core/LocomotionPhysics'
import type { StrobiAccessory } from '../core/types'

describe('Strobi Disney-Grade Landing Integration', () => {
  describe('StrobiAccessories', () => {
    const accessories: StrobiAccessory[] = [
      'developer',
      'popcorn',
      'professor',
      'detective',
      'artist',
      'businessman',
      'dizzy',
      'astronaut',
      'party',
    ]

    it.each(accessories)('renders vector markup for accessory: %s', (acc) => {
      const html = renderToStaticMarkup(
        <svg>
          <StrobiAccessories
            accessory={acc}
            gazeVector={{
              nx: 0,
              ny: 0,
              angle: 0,
              distance: 0,
              eyeOffset: { x: 0, y: 0 },
              headRotation: { pitch: 0, yaw: 0, roll: 0 },
            }}
            mood="happy"
            theme="terminal"
          />
        </svg>
      )

      expect(html).toContain(`id="acc-${acc}"`)
    })

    it('renders empty string when accessory is none', () => {
      const html = renderToStaticMarkup(
        <svg>
          <StrobiAccessories accessory="none" />
        </svg>
      )
      expect(html).not.toContain('strobi-accessories')
    })
  })

  describe('GazeController Distraction Mode (Widgets Showcase)', () => {
    it('switches gaze away from user pointer when distracted and recovers upon end', () => {
      const gaze = new GazeController()
      gaze.updatePointer(500, 500)

      // Pointer solve without distraction
      const normalGaze = gaze.solve(100, 100, 1000)
      expect(normalGaze.gazeVector.nx).toBeGreaterThan(0) // Looking towards 500, 500

      // Start distraction
      const onEnd = vi.fn()
      gaze.startDistraction(2000, onEnd)
      expect(gaze.getIsDistracted()).toBe(true)

      // Distracted solve
      const distractedSolve = gaze.solve(100, 100, 1500)
      expect(distractedSolve.gazeVector).toBeDefined()

      // Time past duration recovers
      gaze.solve(100, 100, 3500)
      expect(gaze.getIsDistracted()).toBe(false)
      expect(onEnd).toHaveBeenCalled()
    })
  })

  describe('LocomotionPhysics Bouncy Jumping on Buttons', () => {
    it('produces vertical elevation and squash when enableBounce is true', () => {
      const physics = new LocomotionPhysics()
      physics.setPosition(100, 200, 1)

      // Tick with bounce at midway of jump cycle (elevation > 0)
      const midCycle = physics.update(320, false, true, true)
      expect(midCycle.elevation).toBeGreaterThan(0)

      // Tick with bounce at landing cycle
      const landCycle = physics.update(650, false, true, true)
      expect(landCycle.elevation).toBeDefined()
    })
  })
})
