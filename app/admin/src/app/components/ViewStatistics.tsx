'use client'

import TicketsByEnforcerPerDay from '../charts/TicketsByEnforcerPerDay'
import TicketsPerDay from '../charts/TicketsPerDay'

export default function ViewStatistics() {
  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Ticket Statistics</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <TicketsByEnforcerPerDay />
        </div>
      </div>
    </>
  )
}