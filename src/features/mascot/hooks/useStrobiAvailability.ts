'use client'

import { useEffect, useState } from 'react'

import { ASSISTANT_SELECTORS } from '../constants/assistant'

export function useStrobiAvailability(protectWorkspace: boolean) {
  const [workspaceBlocked, setWorkspaceBlocked] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const check = () => {
      setPageVisible(!document.hidden)
      setWorkspaceBlocked(
        protectWorkspace && Boolean(document.querySelector(ASSISTANT_SELECTORS.blocking))
      )
    }
    const observer = new MutationObserver(check)
    if (protectWorkspace) observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('visibilitychange', check)
    check()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', check)
    }
  }, [protectWorkspace])

  return { workspaceBlocked, pageVisible, blocked: workspaceBlocked || !pageVisible }
}
