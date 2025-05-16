'use client'

import { useState, useContext } from 'react'
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'

import ZoneContext from './Context'
import theme from '../theme'


export default function Zone() {
  const { next } = useContext(ZoneContext)
  const [isValidSelection, setIsValidSelection] = useState<boolean>(true)
  const [durationOption, setDurationOption] = useState('')

  const options = [
    { label: 'By the hour and the minute', value: 'hourly' },
    { label: 'Maximum Parking Time', value: 'max' },
  ]

  const submitDuration = () => {
    const isValid = !!durationOption
    setIsValidSelection(isValid)
    if (isValid) next()
  }

  return (
    <Box
      sx={{
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        maxWidth: 'calc(100vh * 0.5)',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mt: '1vh' }}>
        What parking rate works for you?
      </Typography>

      <Typography variant="body1" sx={{ marginTop: '1vh', color: '#4b4b4b' }}>
        This parking operator currently offers multiple parking rate options.
      </Typography>

      <RadioGroup
        value={durationOption}
        onChange={(e) => {
          setDurationOption(e.target.value)
          setIsValidSelection(true)
        }}
        sx={{
          mt: '2vh',
          border: '1px solid',
          borderColor: isValidSelection ? '#ccc' : 'error.main',
          borderRadius: '5px',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio sx={{ transform: 'scale(1.2)' }} />}
            label={
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.label}
              </Typography>
            }
            sx={{
              m: 0,
              px: 2,
              py: 1.5,
              borderTop: index !== 0 ? '1px solid #ccc' : 'none',
              backgroundColor: durationOption === option.value ? '#f5f5f5' : 'white',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f9f9f9',
              },
            }}
          />
        ))}
      </RadioGroup>

      {!isValidSelection && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Please select a parking rate
        </Typography>
      )}

      {
        durationOption == 'max' ?
      
        <MaxDuration/>

        :

        null
      }

      <Button
        onClick={submitDuration}
        aria-label="Confirm duration"
        sx={{
          width: '100%',
          marginTop: '5vh',
          alignSelf: 'end',
          fontSize: '1.15rem',
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          textTransform: 'none',
        }}
      >
        Continue
      </Button>
    </Box>
  )
}

function MaxDuration() {
  const { zoneDetails, durationString, setDurationString, price, setPrice } = useContext(ZoneContext)

  const maxDuration = zoneDetails?.maxDuration
  const openTime = zoneDetails?.openTime || '0:00'
  const closeTime = zoneDetails?.closeTime

  const now = new Date()
  let untilCloseMs = Infinity
  let untilOpenMs = Infinity
  let overnight = false

  if (closeTime) {
    const [hours, minutes] = closeTime.split(':').map(Number)
    const close = new Date()
    close.setHours(hours, minutes, 0, 0)
    if (close < now) {
      overnight = true
      const [openHours, openMinutes] = openTime.split(':').map(Number)
      const open = new Date()
      open.setHours(openHours, openMinutes, 0 ,0)
      open.setDate(open.getDate() + 1)
      untilOpenMs = open.getTime() - now.getTime() // overnight case
    }
    untilCloseMs = close.getTime() - now.getTime()
  }

  let maxDurationMs = Infinity
  if (maxDuration) {
    const { hours = 0, minutes = 0 } = maxDuration
    maxDurationMs = (hours * 60 + minutes) * 60 * 1000
  }

  const finalDurationMs = !overnight ? Math.min(untilCloseMs, maxDurationMs) : untilOpenMs

  const totalMinutes = Math.floor(finalDurationMs / (1000 * 60))
  const finalHours = Math.floor(totalMinutes / 60)
  const finalMinutes = totalMinutes % 60

  const durationParts: string[] = []
  if (finalHours) durationParts.push(`${finalHours} ${finalHours === 1 ? 'hour' : 'hours'}`)
  if (finalMinutes) durationParts.push(`${finalMinutes} ${finalMinutes === 1 ? 'minute' : 'minutes'}`)
  setDurationString(durationParts.join(' '))

  const endTime = new Date(now.getTime() + finalDurationMs)
  const endTimeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(endTime)

  setPrice(!overnight ? (totalMinutes * (zoneDetails?.hourly ?? 0) / 60) : 0)
  const estimatedPriceString = `$${(price ? price + 0.50 : 0).toFixed(2)}`

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mt: '1vh' }}>
        Review your duration
      </Typography>

      <Typography variant="body1" sx={{ marginTop: '1vh', color: '#4b4b4b' }}>
        {`This rate (Maximum Parking Time) allows you to park here for ${durationString} until ${endTimeString}.`}
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: '1vh' }}>
        {`Estimated Price: ${estimatedPriceString}`}
      </Typography>
    </Box>
  )
}
