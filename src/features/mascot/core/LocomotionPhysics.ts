import type { LocomotionStyle, SpatialCoordinates } from './types'

export interface LocomotionOptions {
  immediate?: boolean
  style?: LocomotionStyle
  durationMs?: number
  onArrival?: () => void
}

export class LocomotionPhysics {
  private currentX = 0
  private currentY = 0
  private currentScale = 1
  private currentRotation = 0
  private currentElevation = 0
  private currentSquashX = 1
  private currentSquashY = 1

  private targetX = 0
  private targetY = 0
  private targetScale = 1

  private isTraveling = false
  private travelStartTime = 0
  private travelDuration = 800
  private startX = 0
  private startY = 0
  private startScale = 1
  private travelStyle: LocomotionStyle = 'float'
  private onArrivalCallback: (() => void) | null = null

  private squashVelocityX = 0
  private squashVelocityY = 0

  private isDragging = false
  private dragTargetX = 0
  private dragTargetY = 0
  private dragVelocityX = 0
  private dragVelocityY = 0
  private lastDragPointerX = 0
  private lastDragPointerY = 0
  private lastDragTime = 0

  public setPosition(x: number, y: number, scale = 1): void {
    this.currentX = x
    this.currentY = y
    this.targetX = x
    this.targetY = y
    this.currentScale = scale
    this.targetScale = scale
    this.isTraveling = false
    this.isDragging = false
    if (this.onArrivalCallback) {
      const cb = this.onArrivalCallback
      this.onArrivalCallback = null
      cb()
    }
  }

  public updateAnchorTarget(x: number, y: number, scale = 1, immediate = false): void {
    if (this.isDragging) return
    this.targetX = x
    this.targetY = y
    this.targetScale = scale
    if (immediate) {
      this.currentX = x
      this.currentY = y
      this.currentScale = scale
    }
  }

  public startDrag(pointerX: number, pointerY: number, offsetX: number, offsetY: number): void {
    this.isDragging = true
    this.isTraveling = false
    this.dragTargetX = pointerX - offsetX
    this.dragTargetY = pointerY - offsetY
    this.lastDragPointerX = pointerX
    this.lastDragPointerY = pointerY
    this.lastDragTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.currentElevation = 26
    this.triggerSquash(0.92, 1.15)
  }

  public updateDrag(pointerX: number, pointerY: number, offsetX: number, offsetY: number): void {
    if (!this.isDragging) return

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const dt = Math.max(1, now - this.lastDragTime) / 1000

    const vx = (pointerX - this.lastDragPointerX) / dt
    const vy = (pointerY - this.lastDragPointerY) / dt
    this.dragVelocityX = vx
    this.dragVelocityY = vy

    this.lastDragPointerX = pointerX
    this.lastDragPointerY = pointerY
    this.lastDragTime = now

    const mascotSize = 88 * this.currentScale
    const maxX = typeof window !== 'undefined' ? window.innerWidth - mascotSize : 1200
    const maxY = typeof window !== 'undefined' ? window.innerHeight - mascotSize : 900
    this.dragTargetX = Math.max(8, Math.min(maxX - 8, pointerX - offsetX))
    this.dragTargetY = Math.max(8, Math.min(maxY - 8, pointerY - offsetY))
  }

  public endDrag(): { x: number; y: number } {
    this.isDragging = false
    this.targetX = this.currentX
    this.targetY = this.currentY
    this.currentElevation = 0
    this.triggerSquash(1.22, 0.78)
    return { x: this.currentX, y: this.currentY }
  }

  public isDraggingActive(): boolean {
    return this.isDragging
  }

  public travelTo(
    targetX: number,
    targetY: number,
    targetScale = 1,
    options: LocomotionOptions = {}
  ): void {
    if (options.immediate) {
      this.setPosition(targetX, targetY, targetScale)
      if (options.onArrival) options.onArrival()
      return
    }

    const dx = targetX - this.currentX
    const dy = targetY - this.currentY
    const distance = Math.hypot(dx, dy)

    if (distance < 3) {
      this.setPosition(targetX, targetY, targetScale)
      if (options.onArrival) options.onArrival()
      return
    }

    let resolvedStyle = options.style
    if (!resolvedStyle) {
      if (distance < 140) {
        resolvedStyle = 'float'
      } else if (distance < 550) {
        resolvedStyle = 'hop'
      } else {
        resolvedStyle = 'flight'
      }
    }

    this.isTraveling = true
    this.travelStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.startX = this.currentX
    this.startY = this.currentY
    this.startScale = this.currentScale
    this.targetX = targetX
    this.targetY = targetY
    this.targetScale = targetScale
    this.travelStyle = resolvedStyle
    this.onArrivalCallback = options.onArrival ?? null

    if (options.durationMs) {
      this.travelDuration = options.durationMs
    } else {
      switch (resolvedStyle) {
        case 'float':
          this.travelDuration = Math.max(350, Math.min(600, distance * 3.5))
          break
        case 'hop':
          this.travelDuration = Math.max(500, Math.min(850, distance * 1.4))
          break
        case 'flight':
        default:
          this.travelDuration = Math.max(700, Math.min(1200, 500 + distance * 0.5))
          break
      }
    }
  }

  public update(
    currentTime: number,
    reduceMotion = false,
    enableFloat = true,
    enableBounce = false
  ): SpatialCoordinates {
    if (this.isDragging) {
      this.currentX += (this.dragTargetX - this.currentX) * (reduceMotion ? 0.6 : 0.38)
      this.currentY += (this.dragTargetY - this.currentY) * (reduceMotion ? 0.6 : 0.38)

      if (reduceMotion) {
        return {
          x: this.currentX,
          y: this.currentY,
          scale: this.currentScale,
          rotation: 0,
          elevation: 0,
          squashX: 1,
          squashY: 1,
        }
      }

      const targetTilt = Math.max(-24, Math.min(24, this.dragVelocityX * 0.045))
      this.currentRotation += (targetTilt - this.currentRotation) * 0.22

      const speed = Math.hypot(this.dragVelocityX, this.dragVelocityY)
      const stretch = Math.min(0.24, speed * 0.00015)
      this.currentSquashY = 1 + stretch
      this.currentSquashX = 1 - stretch * 0.55

      const bob = Math.sin(currentTime * 0.006) * 2.5
      this.currentElevation = 26 + bob

      this.dragVelocityX *= 0.88
      this.dragVelocityY *= 0.88

      return {
        x: this.currentX,
        y: this.currentY,
        scale: this.currentScale,
        rotation: this.currentRotation,
        elevation: this.currentElevation,
        squashX: this.currentSquashX,
        squashY: this.currentSquashY,
      }
    }

    if (reduceMotion) {
      this.currentX += (this.targetX - this.currentX) * 0.25
      this.currentY += (this.targetY - this.currentY) * 0.25
      this.currentScale += (this.targetScale - this.currentScale) * 0.25
      return {
        x: this.currentX,
        y: this.currentY,
        scale: this.currentScale,
        rotation: 0,
        elevation: 0,
        squashX: 1,
        squashY: 1,
      }
    }

    if (this.isTraveling) {
      const elapsed = currentTime - this.travelStartTime
      const rawProgress = Math.min(1, elapsed / this.travelDuration)

      let spatialProgress: number
      let heightArc = 0
      let tiltAngle = 0
      let squashX = 1
      let squashY = 1

      const moveDirectionX = Math.sign(this.targetX - this.startX)

      if (this.travelStyle === 'hop') {
        if (rawProgress < 0.15) {
          const crouchProg = rawProgress / 0.15
          spatialProgress = 0
          heightArc = -4 * Math.sin(crouchProg * Math.PI)
          squashY = 1 - 0.14 * Math.sin(crouchProg * Math.PI)
          squashX = 1 + 0.12 * Math.sin(crouchProg * Math.PI)
        } else if (rawProgress < 0.85) {
          const flightProg = (rawProgress - 0.15) / 0.7
          spatialProgress = 0.5 - 0.5 * Math.cos(flightProg * Math.PI)
          const hopHeight = 36
          heightArc = hopHeight * Math.sin(flightProg * Math.PI)
          squashY = 1 + 0.12 * Math.sin(flightProg * Math.PI)
          squashX = 1 - 0.08 * Math.sin(flightProg * Math.PI)
          tiltAngle = moveDirectionX * 7 * Math.sin(flightProg * Math.PI)
        } else {
          const landProg = (rawProgress - 0.85) / 0.15
          spatialProgress = 1
          heightArc = 0
          squashY = 1 - 0.16 * Math.sin((1 - landProg) * Math.PI)
          squashX = 1 + 0.14 * Math.sin((1 - landProg) * Math.PI)
          tiltAngle = 0
        }
      } else if (this.travelStyle === 'flight') {
        spatialProgress =
          rawProgress < 0.5
            ? 4 * rawProgress * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2

        const flightPeak = Math.sin(rawProgress * Math.PI)
        heightArc = 48 * flightPeak
        tiltAngle = moveDirectionX * 12 * flightPeak
        squashY = 1 + 0.1 * flightPeak
        squashX = 1 - 0.06 * flightPeak
      } else {
        spatialProgress = 0.5 - 0.5 * Math.cos(rawProgress * Math.PI)
        heightArc = 8 * Math.sin(rawProgress * Math.PI)
        tiltAngle = moveDirectionX * 4 * Math.sin(rawProgress * Math.PI)
      }

      this.currentX = this.startX + (this.targetX - this.startX) * spatialProgress
      this.currentY = this.startY + (this.targetY - this.startY) * spatialProgress
      this.currentScale = this.startScale + (this.targetScale - this.startScale) * spatialProgress
      this.currentElevation = Math.max(0, heightArc)
      this.currentRotation = tiltAngle
      this.currentSquashX = squashX
      this.currentSquashY = squashY

      if (rawProgress >= 1.0) {
        this.isTraveling = false
        this.currentX = this.targetX
        this.currentY = this.targetY
        this.currentScale = this.targetScale
        this.currentElevation = 0
        this.currentRotation = 0

        if (this.onArrivalCallback) {
          const cb = this.onArrivalCallback
          this.onArrivalCallback = null
          cb()
        }
      }

      return {
        x: this.currentX,
        y: this.currentY - heightArc,
        scale: this.currentScale,
        rotation: this.currentRotation,
        elevation: this.currentElevation,
        squashX: this.currentSquashX,
        squashY: this.currentSquashY,
      }
    }

    this.currentX += (this.targetX - this.currentX) * 0.35
    this.currentY += (this.targetY - this.currentY) * 0.35
    this.currentScale += (this.targetScale - this.currentScale) * 0.35

    const springK = 0.2
    const damping = 0.75
    this.squashVelocityX += (1 - this.currentSquashX) * springK
    this.squashVelocityX *= damping
    this.currentSquashX += this.squashVelocityX

    this.squashVelocityY += (1 - this.currentSquashY) * springK
    this.squashVelocityY *= damping
    this.currentSquashY += this.squashVelocityY

    let floatOffset = 0
    if (enableBounce) {
      const jumpPeriod = 640
      const cycle = (currentTime % jumpPeriod) / jumpPeriod
      const jumpHeight = 22
      const jumpY = Math.max(0, 4 * jumpHeight * cycle * (1 - cycle))
      floatOffset = -jumpY
      this.currentElevation = jumpY

      if (cycle < 0.15) {
        const landFactor = Math.sin((cycle / 0.15) * Math.PI)
        this.currentSquashY = 1 - 0.14 * landFactor
        this.currentSquashX = 1 + 0.12 * landFactor
      } else if (cycle > 0.85) {
        const crouchFactor = Math.sin(((cycle - 0.85) / 0.15) * Math.PI)
        this.currentSquashY = 1 - 0.12 * crouchFactor
        this.currentSquashX = 1 + 0.1 * crouchFactor
      } else {
        this.currentSquashY = 1 + 0.08
        this.currentSquashX = 1 - 0.06
      }
    } else if (enableFloat) {
      const t = currentTime * 0.0016
      floatOffset = Math.sin(t) * 5.5
      this.currentElevation = 10 + floatOffset
    } else {
      this.currentElevation = 0
    }

    return {
      x: this.currentX,
      y: this.currentY + floatOffset,
      scale: this.currentScale,
      rotation: 0,
      elevation: Math.max(0, this.currentElevation),
      squashX: this.currentSquashX,
      squashY: this.currentSquashY,
    }
  }

  public triggerSquash(scaleX = 1.12, scaleY = 0.88): void {
    this.currentSquashX = scaleX
    this.currentSquashY = scaleY
    this.squashVelocityX = 0
    this.squashVelocityY = 0
  }

  public isMoving(): boolean {
    return this.isTraveling
  }
}
