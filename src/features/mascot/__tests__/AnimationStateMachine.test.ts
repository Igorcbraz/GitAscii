import { describe, expect, it } from 'vitest'

import { AnimationStateMachine } from '../core/AnimationStateMachine'
import { ActionPriority } from '../core/types'

describe('AnimationStateMachine (Priority & Multi-Channel System)', () => {
  it('starts at default base mood idle', () => {
    const sm = new AnimationStateMachine()
    expect(sm.getMood()).toBe('idle')
  })

  it('allows higher priority action to preempt lower priority action', () => {
    const sm = new AnimationStateMachine()

    // Request Speaking action (Priority 40)
    const speakingAccepted = sm.requestAction({
      id: 'speak-1',
      name: 'speaking',
      priority: ActionPriority.SPEAKING,
      mood: 'thinking',
    })
    expect(speakingAccepted).toBe(true)
    expect(sm.getMood()).toBe('thinking')

    // Request Petting action (Priority 60) -> Higher than Speaking, should preempt!
    const pettingAccepted = sm.requestAction({
      id: 'pet-1',
      name: 'petting',
      priority: ActionPriority.PETTING,
      mood: 'happy',
    })
    expect(pettingAccepted).toBe(true)
    expect(sm.getMood()).toBe('happy')
  })

  it('rejects lower priority action when higher priority action is active', () => {
    const sm = new AnimationStateMachine()

    // Request Guide action (Priority 80)
    sm.requestAction({
      id: 'guide-1',
      name: 'guiding',
      priority: ActionPriority.GUIDE,
      mood: 'curious',
    })
    expect(sm.getMood()).toBe('curious')

    // Attempt to interrupt with contextual reaction (Priority 50)
    const reactionAccepted = sm.requestAction({
      id: 'reaction-1',
      name: 'context-reaction',
      priority: ActionPriority.REACTION,
      mood: 'surprised',
    })
    expect(reactionAccepted).toBe(false)
    // Mood remains the guide mood
    expect(sm.getMood()).toBe('curious')
  })

  it('rolls back to base mood when temporary reaction completes', () => {
    const sm = new AnimationStateMachine()
    sm.setBaseMood('focused')
    expect(sm.getMood()).toBe('focused')

    sm.requestAction({
      id: 'temp-celebrate',
      name: 'celebrate',
      priority: ActionPriority.REACTION,
      mood: 'celebrating',
    })
    expect(sm.getMood()).toBe('celebrating')

    // Complete the temporary action
    sm.completeAction('temp-celebrate')

    // Rolls back cleanly to base mood
    expect(sm.getMood()).toBe('focused')
  })

  it('isolates orthogonal channels so locomotion does not overwrite mood', () => {
    const sm = new AnimationStateMachine()
    sm.setBaseMood('happy')

    sm.setTraveling(true)
    expect(sm.isMoving()).toBe(true)
    expect(sm.getMood()).toBe('happy')

    sm.setTraveling(false)
    expect(sm.isMoving()).toBe(false)
    expect(sm.getMood()).toBe('happy')
  })
})
