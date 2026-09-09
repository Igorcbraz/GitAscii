'use client'

import { useStrobiContext } from '../core/StrobiContext'
import type { StrobiActorState, StrobiController } from '../core/types'

export interface UseStrobiReturn {
  strobe: StrobiController
  state: StrobiActorState
}

export function useStrobi(): UseStrobiReturn {
  const { controller, state } = useStrobiContext()
  return {
    strobe: controller,
    state,
  }
}
