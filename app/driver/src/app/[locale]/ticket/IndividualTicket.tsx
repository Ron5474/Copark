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

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'


import { useTicketState } from './TicketContext'

export default function IndividualTicket() {
  const {currentTicket} = useTicketState()

  return (
    <Card sx={{ mb: 2, boxShadow: 1 }}>
      <CardHeader
        title={currentTicket?.violation}
        subheader={currentTicket?.issueddate}
      />
      <CardContent sx={{ py: 1 }}>
        <Typography variant="body1">
          {currentTicket?.violation}
        </Typography>
      </CardContent>
      {currentTicket?.images && currentTicket.images.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mt: 2 }}>
          {currentTicket.images.map((image, index) => (
            <picture key={index}>
              <source srcSet={image} />
              <img
                src={image}
                alt={`Ticket evidence ${index + 1}`}
                style={{
                  maxHeight: 400,
                  width: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid #e0e0e0'
                }}
              />
            </picture>
          ))}
        </Box>
      )}
    </Card>
  );
}