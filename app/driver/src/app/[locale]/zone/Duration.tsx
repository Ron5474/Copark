'use client'

import { useState, useContext, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material'
import { useTranslations } from "next-intl";

import ZoneContext from './Context'
import theme from '../theme'


export default function Zone() {
  const t = useTranslations('duration');
  const { next } = useContext(ZoneContext)
  const [isValidSelection, setIsValidSelection] = useState<boolean>(true)
  const [durationOption, setDurationOption] = useState('')

  const options = [
    { label: t('option_hourly'), value: 'hourly' },
    { label: t('option_max'), value: 'max' },
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
        {t("title")}
      </Typography>

      <Typography variant="body1" sx={{ marginTop: '1vh', color: '#4b4b4b' }}>
        {t("description")}
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
          {t('error_no_selection')}
        </Typography>
      )}

      {
        durationOption == 'max' ?
      
        <MaxDuration/>

        :

        durationOption == 'hourly' ?

        <SelectDuration/>

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

function SelectDuration() {
  const t = useTranslations('duration')
  const { zoneDetails, setDurationString, setPrice, price, setDuration } = useContext(ZoneContext)
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(5)

  const now = new Date()
  const openTime = zoneDetails?.openTime || '00:00'
  const closeTime = zoneDetails?.closeTime

  let untilCloseMs = Infinity
  let untilOpenMs = Infinity
  let overnight = false

  if (closeTime) {
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number)
    const close = new Date()
    close.setHours(closeHours, closeMinutes, 0, 0)
    if (close < now) {
      overnight = true
      const [openHours, openMinutes] = openTime.split(':').map(Number)
      const open = new Date()
      open.setHours(openHours, openMinutes, 0 ,0)
      open.setDate(open.getDate() + 1)
      untilOpenMs = open.getTime() - now.getTime()
    }
    untilCloseMs = close.getTime() - now.getTime()
  }

  let maxDurationMs = Infinity
  if (zoneDetails?.maxDuration) {
    const { hours = 0, minutes = 0 } = zoneDetails.maxDuration
    maxDurationMs = (hours * 60 + minutes) * 60 * 1000
  }

  const finalDurationMs = !overnight ? Math.min(untilCloseMs, maxDurationMs) : untilOpenMs

  const maxTotalMinutes = Math.floor(finalDurationMs / (1000 * 60))
  const maxHours = Math.floor(maxTotalMinutes / 60)
  const maxMinutes = maxTotalMinutes % 60

  const hourOptions = useMemo(() => {
    return Array.from({ length: maxHours + 1 }, (_, i) => i)
  }, [maxHours])

  const minuteOptions = useMemo(() => {
    const max = selectedHours === maxHours ? maxMinutes : 60
    const step = 5
    const rawOptions = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
  
    return rawOptions.filter((m) => {
      if (selectedHours === 0) {
        return m >= 5 && m < 60
      }
      return m < 60
    })
  }, [selectedHours, maxHours, maxMinutes])
  

  useEffect(() => {
    const totalMinutes = selectedHours * 60 + selectedMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    setDuration({minutes: minutes, hours: hours})
    const parts = []
    if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
    if (minutes) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
    setDurationString(parts.join(' '))
    setPrice((totalMinutes * (zoneDetails?.hourly ?? 0)) / 60)
  }, [selectedHours, selectedMinutes, setDuration, setDurationString, setPrice, zoneDetails?.hourly])


  const estimatedPriceString = `$${(price ? price + 0.50 : 0).toFixed(2)}`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('select_duration')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="hours-label">Hours</InputLabel>
          <Select
            labelId="hours-label"
            value={selectedHours}
            label="Hours"
            onChange={(e) => {
              const newHours = Number(e.target.value)
              setSelectedHours(newHours)
              if (newHours === 0) {
                setSelectedMinutes(5)
              } else {
                setSelectedMinutes(0)
              }
            }}
            fullWidth
          >
            {hourOptions.map((hour) => (
              <MenuItem key={hour} value={hour}>{hour}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="minutes-label">Minutes</InputLabel>
          <Select
            labelId="minutes-label"
            value={selectedMinutes}
            label="Minutes"
            onChange={(e) => setSelectedMinutes(Number(e.target.value))}
            fullWidth
          >
            {minuteOptions.map((minute) => (
              <MenuItem key={minute} value={minute}>{minute.toString()}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h6" sx={{ mt: '2vh' }}>
        {t('estimated_price')} <Typography color='primary' variant="h5" component="span">{estimatedPriceString}</Typography>
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        {t('fees_notice')}
      </Typography>
    </Box>
  )
}

function MaxDuration() {
  const t = useTranslations('duration')
  const { zoneDetails, durationString, setDurationString, price, setPrice, setDuration } = useContext(ZoneContext)

  const optionString = t('option_max')
  const endTimeStringRef = useRef('')
  const estimatedPriceStringRef = useRef(`$${0.0.toFixed(2)}`)

  useEffect(() => {

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

    setDuration({minutes: finalMinutes, hours: finalHours})

    const durationParts: string[] = []
    if (finalHours) durationParts.push(`${finalHours} ${finalHours === 1 ? 'hour' : 'hours'}`)
    if (finalMinutes) durationParts.push(`${finalMinutes} ${finalMinutes === 1 ? 'minute' : 'minutes'}`)
    setDurationString(durationParts.join(' '))

    const endTime = new Date(now.getTime() + finalDurationMs)
    endTimeStringRef.current = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(endTime)

    if (zoneDetails?.hourly) {
      setPrice(!overnight ? (totalMinutes * (zoneDetails.hourly || 0) / 60) : 0)
      estimatedPriceStringRef.current = `$${(price ? price + 0.50 : 0).toFixed(2)}`
    }
  }, [zoneDetails, setDuration, setDurationString, setPrice, price])
  

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mt: '2vh' }}>
        {t('review_duration')}
      </Typography>

      <Typography variant="body1" sx={{ marginTop: '1vh', color: '#4b4b4b' }}>
        {t('duration_summary', { option: optionString, duration: durationString, endTime: endTimeStringRef.current, })}
      </Typography>

      <Typography variant="h6" sx={{ mt: '2vh' }}>
        {t('estimated_price')} <Typography color='primary' variant="h5" component="span">{estimatedPriceStringRef.current}</Typography>
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        {`Transaction fees and taxes may apply in later steps.`}
      </Typography>
    </Box>
  )
}
