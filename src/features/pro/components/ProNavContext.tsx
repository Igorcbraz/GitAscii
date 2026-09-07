'use client'

import React, { createContext, useContext, useState } from 'react'

interface ProNavContextType {
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
}

const ProNavContext = createContext<ProNavContextType>({
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  toggleMobileNav: () => {},
})

export const ProNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev)

  return (
    <ProNavContext.Provider value={{ mobileNavOpen, setMobileNavOpen, toggleMobileNav }}>
      {children}
    </ProNavContext.Provider>
  )
}

export const useProNav = () => useContext(ProNavContext)
