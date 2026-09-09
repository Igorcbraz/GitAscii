import { describe, expect, it } from 'vitest'

import { SpeechQueue } from '../core/SpeechQueue'
import { ActionPriority } from '../core/types'

describe('SpeechQueue (Priority Queue & Mute Control)', () => {
  it('enqueues and displays a message when queue is empty', () => {
    const queue = new SpeechQueue()
    queue.enqueue({
      id: 'tip-1',
      message: 'Bem-vindo ao GitAscii!',
      duration: 3000,
    })

    const active = queue.getActiveMessage()
    expect(active).not.toBeNull()
    expect(active?.id).toBe('tip-1')
    expect(active?.message).toBe('Bem-vindo ao GitAscii!')
  })

  it('preempts active message when a higher priority message arrives', () => {
    const queue = new SpeechQueue()

    // Normal tip (priority 40)
    queue.enqueue({
      id: 'low-priority',
      message: 'Dica comum de atalho.',
      priority: ActionPriority.SPEAKING,
    })
    expect(queue.getActiveMessage()?.id).toBe('low-priority')

    // Guide tip (priority 80)
    queue.enqueue({
      id: 'high-priority',
      message: 'Atenção: clique no botão para salvar!',
      priority: ActionPriority.GUIDE,
    })

    // Preempted immediately!
    expect(queue.getActiveMessage()?.id).toBe('high-priority')
  })

  it('suppresses automated speech when muted', () => {
    const queue = new SpeechQueue()
    queue.mute()
    expect(queue.isMuted()).toBe(true)

    // Standard automated tip should be ignored
    const accepted = queue.enqueue({
      id: 'auto-tip',
      message: 'Dica não solicitada.',
      priority: ActionPriority.SPEAKING,
    })

    expect(accepted).toBe(false)
    expect(queue.getActiveMessage()).toBeNull()

    // Unmute
    queue.unmute()
    expect(queue.isMuted()).toBe(false)

    // Now accepted
    const acceptedAfterUnmute = queue.enqueue({
      id: 'tip-unmuted',
      message: 'Dica após desmutar.',
      priority: ActionPriority.SPEAKING,
    })
    expect(acceptedAfterUnmute).toBe(true)
    expect(queue.getActiveMessage()?.id).toBe('tip-unmuted')
  })

  it('dismisses active message on demand', () => {
    const queue = new SpeechQueue()
    queue.enqueue({
      id: 'msg-to-dismiss',
      message: 'Mensagem temporária.',
    })
    expect(queue.getActiveMessage()).not.toBeNull()

    queue.dismiss()
    expect(queue.getActiveMessage()).toBeNull()
  })
})
