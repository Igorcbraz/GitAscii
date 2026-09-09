import { ActionPriority, type StateMachineAction, type StrobiMood } from './types'

export interface StateMachineListener {
  (currentMood: StrobiMood, previousMood: StrobiMood): void
}

export class AnimationStateMachine {
  private baseMood: StrobiMood = 'idle'
  private currentAction: StateMachineAction | null = null
  private actionTimeout: ReturnType<typeof setTimeout> | null = null
  private listeners = new Set<StateMachineListener>()

  private isTraveling = false
  private isSpeaking = false
  private isPetting = false
  private isGuiding = false
  private isGrabbingCursor = false

  public getMood(): StrobiMood {
    if (this.currentAction) {
      return this.currentAction.mood
    }
    return this.baseMood
  }

  public setBaseMood(mood: StrobiMood): void {
    const prev = this.getMood()
    this.baseMood = mood
    const next = this.getMood()
    if (prev !== next) {
      this.notify(next, prev)
    }
  }

  public requestAction(action: StateMachineAction): boolean {
    const currentPriority = this.currentAction ? this.currentAction.priority : ActionPriority.IDLE

    if (action.priority >= currentPriority) {
      if (this.actionTimeout) {
        clearTimeout(this.actionTimeout)
        this.actionTimeout = null
      }

      const prevMood = this.getMood()
      this.currentAction = action

      if (action.duration && action.duration > 0) {
        this.actionTimeout = setTimeout(() => {
          this.completeAction(action.id)
        }, action.duration)
      }

      const newMood = this.getMood()
      if (prevMood !== newMood) {
        this.notify(newMood, prevMood)
      }
      return true
    }

    return false
  }

  public completeAction(actionId?: string): void {
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout)
      this.actionTimeout = null
    }

    if (!actionId || (this.currentAction && this.currentAction.id === actionId)) {
      const prevMood = this.getMood()
      const finished = this.currentAction
      this.currentAction = null

      if (finished?.onComplete) {
        try {
          finished.onComplete()
        } catch (e) {
          console.error('Action onComplete error:', e)
        }
      }

      const newMood = this.getMood()
      if (prevMood !== newMood) {
        this.notify(newMood, prevMood)
      }
    }
  }

  public setTraveling(traveling: boolean): void {
    this.isTraveling = traveling
  }

  public isMoving(): boolean {
    return this.isTraveling
  }

  public setSpeaking(speaking: boolean): void {
    this.isSpeaking = speaking
  }

  public getSpeaking(): boolean {
    return this.isSpeaking
  }

  public setPetting(petting: boolean): void {
    this.isPetting = petting
  }

  public getPetting(): boolean {
    return this.isPetting
  }

  public setGuiding(guiding: boolean): void {
    this.isGuiding = guiding
  }

  public getGuiding(): boolean {
    return this.isGuiding
  }

  public setGrabbingCursor(grabbing: boolean): void {
    this.isGrabbingCursor = grabbing
  }

  public getGrabbingCursor(): boolean {
    return this.isGrabbingCursor
  }

  public subscribe(listener: StateMachineListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(current: StrobiMood, previous: StrobiMood): void {
    this.listeners.forEach((listener) => {
      try {
        listener(current, previous)
      } catch (e) {
        console.error('AnimationStateMachine notification error:', e)
      }
    })
  }

  public reset(): void {
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout)
      this.actionTimeout = null
    }
    this.currentAction = null
    this.baseMood = 'idle'
    this.isTraveling = false
    this.isSpeaking = false
    this.isPetting = false
    this.isGuiding = false
    this.isGrabbingCursor = false
  }
}
