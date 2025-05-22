'use client'

import { createContext, useContext, useState } from 'react'

import { TicketContextType } from '../types'


const TicketContext = createContext<TicketContextType|undefined>(undefined)

export function TicketProvider({children}: {children: React.ReactNode} ) {
  const [currentView, setCurrentView] = useState<string>('TicketList')

  return (
    <TicketContext.Provider value={{currentView, setCurrentView}}>
        {children}
    </TicketContext.Provider>
  )
}

export function useTicketState() {
  const ctx = useContext(TicketContext)
  if (ctx === undefined) {
    throw new Error('Context is undefined')
  }
  return ctx
}
