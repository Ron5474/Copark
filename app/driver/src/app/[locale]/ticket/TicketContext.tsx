'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { TicketContextType, Ticket } from '../types'

const TicketContext = createContext<TicketContextType|undefined>(undefined)

export function TicketProvider({children}: {children: React.ReactNode} ) {
  const [currentView, setCurrentView] = useState<string>('TicketList')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket|undefined>(undefined)

  const fetchTickets = async () => {
    // setMembers(await getMembers())
    setTickets([
      {
        id: "enc_7f8a9b3c4d5e6f7g8h9i0j",
        vehicle: "Toyota Camry (ABC-1234)",
        enforcer: "enc_5e6f7g8h9i0j1k2l3m4n5o",
        issueddate: "2025-03-15",
        violation: "Parking in no-parking zone",
        fine: 75.00,
        ticketStatus: "unpaid",
        images: ["https://picsum.photos/id/19/2500/1667.jpg", "https://picsum.photos/id/19/2500/1667.jpg"]
      },
      {
        id: "enc_2c3d4e5f6g7h8i9j0k1l2m",
        vehicle: "Honda Civic (XYZ-9876)",
        enforcer: "enc_8h9i0j1k2l3m4n5o6p7q8r",
        issueddate: "2025-04-02",
        violation: "Expired meter",
        fine: 45.50,
        ticketStatus: "challenged",
        images: ["https://picsum.photos/id/19/2500/1667.jpg"]
      },
      {
        id: "enc_1efd4e5fgh3h8i9j0k1l2m",
        vehicle: "Honda Accord (XYZ-9926)",
        enforcer: "enc_8h9i0j1k2l3m4n5o6p7q8r",
        issueddate: "2025-04-03",
        violation: "No Valid Permit",
        fine: 85.50,
        ticketStatus: "challenged",
        images: ["https://picsum.photos/id/19/2500/1667.jpg", "https://picsum.photos/id/19/2500/1667.jpg", "https://picsum.photos/id/19/2500/1667.jpg"]
      },
    ])
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <TicketContext.Provider value={{currentView, setCurrentView, tickets, setTickets, currentTicket, setCurrentTicket}}>
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
