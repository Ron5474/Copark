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
import { useTicketState } from './TicketContext'
import { Toolbar } from '@mui/material'

export default function TicketList() {
  const {tickets} = useTicketState()
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
        
        {tickets.map((ticket) => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
          />
        ))}
        
        {tickets.length === 0 && (
          <Typography variant="body1" textAlign="center">
            No tickets found.
          </Typography>
        )}
        <Toolbar />
      </Stack>
    </Container>
  );
}