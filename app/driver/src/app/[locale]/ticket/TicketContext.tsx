'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { TicketContextType, Ticket } from '../types'
import { getTickets } from './actions'

const TicketContext = createContext<TicketContextType|undefined>(undefined)

export function TicketProvider({children}: {children: React.ReactNode} ) {
  const [currentView, setCurrentView] = useState<string>('TicketList')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket|undefined>(undefined)

  const fetchTickets = async () => {
    setTickets(await getTickets())
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <TicketContext.Provider value={{currentView, setCurrentView, tickets, setTickets, currentTicket, setCurrentTicket, fetchTickets}}>
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
