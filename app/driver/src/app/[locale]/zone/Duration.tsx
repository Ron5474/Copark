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