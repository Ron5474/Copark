'use client'


import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'


import { Payment } from '../shared/actions'
import { useTicketState } from './TicketContext'
import theme from '../theme'
import { useTranslations } from 'next-intl'

export default function IndividualTicketButtons() {
  const { currentTicket, setCurrentView } = useTicketState()
  const t = useTranslations('ticket')

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const handleTicketPayment = async () => {
    const amount = parseFloat((currentTicket?.fine as number).toFixed(2))*100
    const paymentDetails = {
      price: amount,
      currency: 'USD',
    }
    const permitDetails = {
      type: "ticket",
      ticketId: currentTicket?.id,
      ticketFine: amount
    }
    sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails))
    sessionStorage.setItem('ticketDetails', JSON.stringify(permitDetails))
    await Payment("ticket", "Ticket Payment", amount, `Payment for Ticket ${currentTicket?.id.substring(0, 5)}`, "USD")
  }

  return (
    <Paper 
      sx={{ 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #fff8e1 0%, #f3e5f5 100%)',
        border: '1px solid rgba(0, 121, 107, 0.12)',
        textAlign: 'center'
      }}
    >
      {currentTicket?.ticketStatus === 'unpaid'  && <Button
        onClick={() => handleViewChange('ChallengeTicket')}
        variant="contained"
        size="large"
        fullWidth
        sx={{ 
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          textTransform: 'none',
          fontWeight: 600,
          py: 1.5,
          borderRadius: 2,
        }}
      >
        {t('challengeTicket')}
      </Button>}

      <Button
        onClick={handleTicketPayment}
        variant="contained"
        size="large"
        fullWidth
        sx={{
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          textTransform: 'none',
          fontWeight: 600,
          py: 1.5,
          mt: '15px',
          borderRadius: 2,
        }}
      >
        {t('payTicket')}
      </Button>
    </Paper>
  )
}