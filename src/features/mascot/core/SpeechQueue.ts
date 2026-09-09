import { ActionPriority, type StrobiSpeechMessage } from './types'

export interface SpeechQueueListener {
  (currentMessage: StrobiSpeechMessage | null): void
}

const STORAGE_KEY_MUTED = 'gitascii_strobi_muted'

export class SpeechQueue {
  private queue: StrobiSpeechMessage[] = []
  private activeMessage: StrobiSpeechMessage | null = null
  private dismissTimer: ReturnType<typeof setTimeout> | null = null
  private isMutedState = false
  private listeners = new Set<SpeechQueueListener>()

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MUTED)
        this.isMutedState = stored === 'true'
      } catch {
        // Safe fallback if localStorage disabled
      }
    }
  }

  public isMuted(): boolean {
    return this.isMutedState
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, muted ? 'true' : 'false')
      } catch {}
    }
    if (muted && this.activeMessage) {
      this.dismiss()
    }
  }

  public mute(): void {
    this.setMuted(true)
  }

  public unmute(): void {
    this.setMuted(false)
  }

  public getActiveMessage(): StrobiSpeechMessage | null {
    return this.activeMessage
  }

  public enqueue(message: StrobiSpeechMessage): boolean {
    const priority = message.priority ?? ActionPriority.SPEAKING
    if (this.isMutedState && priority < ActionPriority.GUIDE) {
      return false
    }

    const messageWithPriority: StrobiSpeechMessage = {
      ...message,
      priority,
      duration: message.duration ?? 5000,
    }

    if (!this.activeMessage) {
      this.show(messageWithPriority)
      return true
    }

    const activePriority = this.activeMessage.priority ?? ActionPriority.SPEAKING
    if (priority > activePriority) {
      const old = this.activeMessage
      this.clearTimer()
      this.queue.unshift(old)
      this.show(messageWithPriority)
      return true
    }

    const insertIdx = this.queue.findIndex((item) => (item.priority ?? 0) < priority)
    if (insertIdx === -1) {
      this.queue.push(messageWithPriority)
    } else {
      this.queue.splice(insertIdx, 0, messageWithPriority)
    }

    return true
  }

  private show(message: StrobiSpeechMessage): void {
    this.clearTimer()
    this.activeMessage = message
    this.notify()

    if (!message.persistent) {
      const duration = message.duration ?? 5000
      this.dismissTimer = setTimeout(() => {
        this.advance()
      }, duration)
    }
  }

  public dismiss(): void {
    this.clearTimer()
    this.activeMessage = null
    this.notify()
  }

  public advance(): void {
    this.clearTimer()
    if (this.queue.length > 0) {
      const next = this.queue.shift()!
      this.show(next)
    } else {
      this.activeMessage = null
      this.notify()
    }
  }

  private clearTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer)
      this.dismissTimer = null
    }
  }

  public subscribe(listener: SpeechQueueListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.activeMessage)
      } catch (e) {
        console.error('SpeechQueue notification error:', e)
      }
    })
  }

  public clear(): void {
    this.clearTimer()
    this.queue = []
    this.activeMessage = null
    this.notify()
  }
}
