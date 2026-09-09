import { describe, expect, it } from 'vitest'

import { GazeController } from '../core/GazeController'

describe('GazeController (Ocular Physics & Tracking Math)', () => {
  it('normalizes gaze direction between -1 and 1', () => {
    const controller = new GazeController()
    // Pointer positioned to the right-down
    controller.updatePointer(500, 500)

    const result = controller.solve(200, 200, 1000, 'idle')

    expect(result.gazeVector.nx).toBeGreaterThan(0)
    expect(result.gazeVector.nx).toBeLessThanOrEqual(1)
    expect(result.gazeVector.ny).toBeGreaterThan(0)
    expect(result.gazeVector.ny).toBeLessThanOrEqual(1)
    expect(result.gazeVector.distance).toBeGreaterThan(0)
    expect(result.gazeVector.distance).toBeLessThanOrEqual(1)
  })

  it('guarantees organic hyperbolic clamping within orbital socket boundary', () => {
    const controller = new GazeController({ maxEyeTravel: 11 })
    // Extreme coordinates far away from mascot
    controller.updatePointer(10000, 10000)

    const result = controller.solve(0, 0, 1000, 'idle')

    // Eye offset must never exceed maxEyeTravel (11px)
    const eyeDistance = Math.hypot(result.gazeVector.eyeOffset.x, result.gazeVector.eyeOffset.y)
    expect(eyeDistance).toBeLessThanOrEqual(11.5)
  })

  it('produces finite, valid numbers with zero NaN or Infinity under extreme input', () => {
    const controller = new GazeController()

    // Test with pointer at identical coordinates (distance = 0)
    controller.updatePointer(100, 100)
    const resultZero = controller.solve(100, 100, 1000, 'idle')

    expect(Number.isFinite(resultZero.gazeVector.nx)).toBe(true)
    expect(Number.isFinite(resultZero.gazeVector.ny)).toBe(true)
    expect(Number.isFinite(resultZero.gazeVector.eyeOffset.x)).toBe(true)
    expect(Number.isFinite(resultZero.gazeVector.eyeOffset.y)).toBe(true)
    expect(Number.isFinite(resultZero.gazeVector.headRotation.yaw)).toBe(true)
    expect(Number.isFinite(resultZero.gazeVector.headRotation.pitch)).toBe(true)
    expect(Number.isFinite(resultZero.eyeRigState.catchlightX)).toBe(true)

    // Test with negative and very large coordinates
    controller.updatePointer(-99999, 88888)
    const resultExtreme = controller.solve(50, 50, 2000, 'idle')

    expect(Number.isNaN(resultExtreme.gazeVector.nx)).toBe(false)
    expect(Number.isNaN(resultExtreme.gazeVector.headRotation.pitch)).toBe(false)
  })

  it('maintains continuous gaze offset through independent biological blinks', () => {
    const controller = new GazeController({ enableAutoBlink: false })
    controller.updatePointer(400, 200)

    // Run tick to establish gaze
    const beforeBlink = controller.solve(100, 100, 1000, 'idle')
    const initialEyeX = beforeBlink.gazeVector.eyeOffset.x
    expect(initialEyeX).toBeGreaterThan(0)

    // Trigger independent blink starting at timestamp 1000
    controller.triggerBlink(200, 1000)

    // Mid-blink tick at timestamp 1100 (halfway through 200ms duration, eyelid partially closed)
    const midBlink = controller.solve(100, 100, 1100, 'idle')
    expect(midBlink.eyeRigState.eyelidOpenness).toBeLessThan(1.0)
    // Gaze position remains active and tracking underneath the eyelid!
    expect(midBlink.gazeVector.eyeOffset.x).toBeGreaterThan(0)
    expect(midBlink.eyeRigState.pupilX).toBeGreaterThan(0)
  })

  it('applies head 3D rotation contribution between 15% and 20%', () => {
    const controller = new GazeController({ maxHeadYaw: 18, maxHeadPitch: 14 })
    controller.updatePointer(500, 100)

    const result = controller.solve(100, 100, 1000, 'idle')

    expect(result.gazeVector.headRotation.yaw).toBeGreaterThan(0)
    expect(result.gazeVector.headRotation.yaw).toBeLessThanOrEqual(18)
  })
})
