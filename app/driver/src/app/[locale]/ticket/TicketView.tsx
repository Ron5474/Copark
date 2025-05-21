/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
'use client'

import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import TicketCard from './TicketCard'


interface Ticket {
  id: string;
  ticketStatus: string;
}

export default function TicketView() {
  const fakeTickets: Ticket[] = [
    {
      id: "enc_7f8a9b3c4d5e6f7g8h9i0j",
      // vehicle: "Toyota Camry (ABC-1234)",
      // enforcer: "enc_5e6f7g8h9i0j1k2l3m4n5o",
      // issuedDate: new Date("2025-03-15T14:30:00"),
      // violation: "Parking in no-parking zone",
      // fine: 75.00,
      ticketStatus: "unpaid",
      // images: ["img_front.jpg", "img_side.jpg"]
    },
    {
      id: "enc_2c3d4e5f6g7h8i9j0k1l2m",
      // vehicle: "Honda Civic (XYZ-9876)",
      // enforcer: "enc_8h9i0j1k2l3m4n5o6p7q8r",
      // issuedDate: new Date("2025-04-02T09:15:00"),
      // violation: "Expired meter",
      // fine: 45.50,
      ticketStatus: "paid",
      // images: ["img_meter.jpg", "img_vehicle.jpg"]
    },
  ];
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '0vh',
        py: 4
      }}
    >
      <Stack spacing={4} width="100%">
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          Your Tickets
        </Typography>
        
        {fakeTickets.map((ticket) => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
          />
        ))}
        
        {fakeTickets.length === 0 && (
          <Typography variant="body1" textAlign="center">
            No tickets found.
          </Typography>
        )}
      </Stack>
    </Container>
  );
}