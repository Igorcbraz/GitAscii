import type { EyeRigState, GazePoint, GazeVector, StrobiMood } from './types'

export interface GazeControllerConfig {
  maxEyeTravel?: number
  maxHeadYaw?: number
  maxHeadPitch?: number
  eyeLerpFactor?: number
  headLerpFactor?: number
  enableMicroSaccades?: boolean
  enableAutoBlink?: boolean
}

export class GazeController {
  private config: Required<GazeControllerConfig>

  private targetPointer: GazePoint = { x: 0, y: 0 }
  private hasPointer = false
  private customLookTarget: HTMLElement | GazePoint | null = null
  private lastPointerActivityTime = 0

  private currentEyeX = 0
  private currentEyeY = 0
  private currentHeadYaw = 0
  private currentHeadPitch = 0
  private currentHeadRoll = 0

  private saccadeOffsetX = 0
  private saccadeOffsetY = 0
  private nextSaccadeTime = 0

  private eyelidOpenness = 1.0
  private isBlinking = false
  private blinkStartTime = 0
  private blinkDuration = 220
  private nextBlinkTime = 0
  private isDoubleBlink = false
  private doubleBlinkPhase = 0

  private isDistracted = false
  private distractionStartTime = 0
  private distractionDuration = 0
  private onDistractionEnd: (() => void) | null = null
  private distractionTargetIndex = 0
  private nextDistractionShiftTime = 0
  private currentDistractionOffset = { x: 0, y: 0 }

  constructor(config: GazeControllerConfig = {}) {
    this.config = {
      maxEyeTravel: config.maxEyeTravel ?? 11,
      maxHeadYaw: config.maxHeadYaw ?? 18,
      maxHeadPitch: config.maxHeadPitch ?? 14,
      eyeLerpFactor: config.eyeLerpFactor ?? 0.18,
      headLerpFactor: config.headLerpFactor ?? 0.12,
      enableMicroSaccades: config.enableMicroSaccades ?? true,
      enableAutoBlink: config.enableAutoBlink ?? true,
    }

    if (typeof window !== 'undefined') {
      this.targetPointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      this.scheduleNextBlink(performance.now() + 2000)
      this.scheduleNextSaccade(performance.now() + 1500)
    }
  }

  public updatePointer(x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    this.targetPointer.x = x
    this.targetPointer.y = y
    this.hasPointer = true
    this.lastPointerActivityTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  public setLookTarget(target: HTMLElement | GazePoint | null): void {
    this.customLookTarget = target
  }

  public startDistraction(durationMs = 4500, onEnd?: () => void): void {
    this.isDistracted = true
    this.distractionStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.distractionDuration = durationMs
    this.onDistractionEnd = onEnd ?? null
    this.distractionTargetIndex = 0
    this.nextDistractionShiftTime = 0
    this.customLookTarget = null
  }

  public stopDistraction(): void {
    if (this.isDistracted) {
      this.isDistracted = false
      const cb = this.onDistractionEnd
      this.onDistractionEnd = null
      cb?.()
    }
  }

  public getIsDistracted(): boolean {
    return this.isDistracted
  }

  public triggerBlink(duration = 200, startTime?: number): void {
    this.isBlinking = true
    this.blinkStartTime =
      startTime ?? (typeof performance !== 'undefined' ? performance.now() : Date.now())
    this.blinkDuration = duration
    this.isDoubleBlink = false
  }

  private scheduleNextBlink(fromTime: number): void {
    const interval = 2800 + Math.random() * 2700
    this.nextBlinkTime = fromTime + interval
  }

  private scheduleNextSaccade(fromTime: number): void {
    const interval = 1200 + Math.random() * 2000
    this.nextSaccadeTime = fromTime + interval
  }

  public solve(
    mascotCenterX: number,
    mascotCenterY: number,
    currentTime: number,
    mood: StrobiMood = 'idle',
    reduceMotion = false
  ): {
    gazeVector: GazeVector
    eyeRigState: EyeRigState
  } {
    let targetX = this.targetPointer.x
    let targetY = this.targetPointer.y

    if (this.isDistracted) {
      if (currentTime > this.distractionStartTime + this.distractionDuration) {
        this.stopDistraction()
      } else {
        if (currentTime >= this.nextDistractionShiftTime) {
          const offsets = [
            { x: -320, y: -160 },
            { x: 340, y: -110 },
            { x: -280, y: 190 },
            { x: 300, y: 240 },
            { x: -140, y: -260 },
            { x: 220, y: -280 },
          ]
          this.distractionTargetIndex = (this.distractionTargetIndex + 1) % offsets.length
          this.currentDistractionOffset = offsets[this.distractionTargetIndex]
          this.nextDistractionShiftTime = currentTime + 650 + Math.random() * 400
        }
        targetX = mascotCenterX + this.currentDistractionOffset.x
        targetY = mascotCenterY + this.currentDistractionOffset.y
      }
    } else if (this.customLookTarget) {
      if ('getBoundingClientRect' in this.customLookTarget) {
        const rect = (this.customLookTarget as HTMLElement).getBoundingClientRect()
        targetX = rect.left + rect.width / 2
        targetY = rect.top + rect.height / 2
      } else if ('x' in this.customLookTarget && 'y' in this.customLookTarget) {
        targetX = this.customLookTarget.x
        targetY = this.customLookTarget.y
      }
    } else if (!this.hasPointer || currentTime - this.lastPointerActivityTime > 6000) {
      const driftAngle = currentTime * 0.0008
      targetX = mascotCenterX + Math.cos(driftAngle) * 80
      targetY = mascotCenterY + Math.sin(driftAngle) * 40 + 60
    }

    if (!Number.isFinite(mascotCenterX) || !Number.isFinite(mascotCenterY)) {
      mascotCenterX = 0
      mascotCenterY = 0
    }

    const dx = targetX - mascotCenterX
    const dy = targetY - mascotCenterY
    const rawDist = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)

    const nx = rawDist > 0.001 ? dx / rawDist : 0
    const ny = rawDist > 0.001 ? dy / rawDist : 0
    const saturationRadius = 350
    const normalizedDistance = Math.min(1, Math.tanh(rawDist / saturationRadius))

    const targetEyeDistance = normalizedDistance * this.config.maxEyeTravel
    const targetEyeX = nx * targetEyeDistance
    const targetEyeY = ny * targetEyeDistance

    const targetHeadYaw = nx * normalizedDistance * this.config.maxHeadYaw
    const targetHeadPitch = -ny * normalizedDistance * this.config.maxHeadPitch
    const targetHeadRoll = -nx * normalizedDistance * 3.5

    if (this.config.enableMicroSaccades && !reduceMotion) {
      if (currentTime >= this.nextSaccadeTime) {
        this.saccadeOffsetX = (Math.random() - 0.5) * 2.2
        this.saccadeOffsetY = (Math.random() - 0.5) * 1.8
        this.scheduleNextSaccade(currentTime)
      } else {
        this.saccadeOffsetX *= 0.94
        this.saccadeOffsetY *= 0.94
      }
    } else {
      this.saccadeOffsetX = 0
      this.saccadeOffsetY = 0
    }

    const eyeLerp = reduceMotion ? 1.0 : this.config.eyeLerpFactor
    const headLerp = reduceMotion ? 1.0 : this.config.headLerpFactor

    this.currentEyeX += (targetEyeX - this.currentEyeX) * eyeLerp
    this.currentEyeY += (targetEyeY - this.currentEyeY) * eyeLerp

    this.currentHeadYaw += (targetHeadYaw - this.currentHeadYaw) * headLerp
    this.currentHeadPitch += (targetHeadPitch - this.currentHeadPitch) * headLerp
    this.currentHeadRoll += (targetHeadRoll - this.currentHeadRoll) * headLerp

    if (this.isBlinking) {
      const elapsed = currentTime - this.blinkStartTime
      const progress = Math.min(1, elapsed / this.blinkDuration)

      if (this.isDoubleBlink) {
        this.eyelidOpenness = Math.abs(Math.sin(progress * Math.PI * 2))
      } else {
        this.eyelidOpenness = 1.0 - Math.sin(progress * Math.PI)
      }

      if (progress >= 1.0) {
        this.isBlinking = false
        this.eyelidOpenness = 1.0
        this.scheduleNextBlink(currentTime)
      }
    } else if (this.config.enableAutoBlink && !reduceMotion) {
      if (currentTime >= this.nextBlinkTime) {
        this.isBlinking = true
        this.blinkStartTime = currentTime
        this.blinkDuration = 200 + Math.random() * 60
        this.isDoubleBlink = Math.random() < 0.12
        this.doubleBlinkPhase = 0
      } else {
        this.eyelidOpenness = 1.0
      }
    } else {
      this.eyelidOpenness = 1.0
    }

    let isSquinting = false
    let shape: EyeRigState['shape'] = 'normal'

    if (mood === 'sleeping') {
      this.eyelidOpenness = 0.0
      shape = 'closed'
    } else if (mood === 'happy' || mood === 'petting' || mood === 'celebrating') {
      isSquinting = true
      shape = 'happy-crescent'
    } else if (mood === 'surprised' || mood === 'excited') {
      shape = 'surprised-wide'
    }

    const safeEyeX = Number.isFinite(this.currentEyeX) ? this.currentEyeX + this.saccadeOffsetX : 0
    const safeEyeY = Number.isFinite(this.currentEyeY) ? this.currentEyeY + this.saccadeOffsetY : 0
    const safeHeadYaw = Number.isFinite(this.currentHeadYaw) ? this.currentHeadYaw : 0
    const safeHeadPitch = Number.isFinite(this.currentHeadPitch) ? this.currentHeadPitch : 0
    const safeHeadRoll = Number.isFinite(this.currentHeadRoll) ? this.currentHeadRoll : 0

    const gazeVector: GazeVector = {
      nx,
      ny,
      angle,
      distance: normalizedDistance,
      eyeOffset: { x: safeEyeX, y: safeEyeY },
      headRotation: {
        pitch: safeHeadPitch,
        yaw: safeHeadYaw,
        roll: safeHeadRoll,
      },
    }

    const catchlightX = -safeEyeX * 0.35 + 2.5
    const catchlightY = -safeEyeY * 0.35 - 2.5

    const eyeRigState: EyeRigState = {
      pupilX: safeEyeX,
      pupilY: safeEyeY,
      catchlightX,
      catchlightY,
      eyelidOpenness: this.eyelidOpenness,
      isSquinting,
      shape,
    }

    return { gazeVector, eyeRigState }
  }

  public reset(): void {
    this.currentEyeX = 0
    this.currentEyeY = 0
    this.currentHeadYaw = 0
    this.currentHeadPitch = 0
    this.currentHeadRoll = 0
    this.eyelidOpenness = 1.0
    this.isBlinking = false
  }
}
