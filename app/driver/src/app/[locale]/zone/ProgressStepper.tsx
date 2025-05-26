/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import React from 'react'
import { Box, Typography } from '@mui/material'
import theme from '../theme'
// import { useTranslations } from 'next-intl'

// Props for the stepper
type CustomStepperProps = {
  steps: string[]
  activeStep: string
}

export default function CustomStepper({ steps, activeStep }: CustomStepperProps) {
  // const t = useTranslations('stepper')
  const stepNum = steps.findIndex((step) => step === activeStep)
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(2),
        flexWrap: 'nowrap',
        // overflowX: 'auto',
        gap: theme.spacing(1),
      }}
    >
      {steps.map((label, index) => {
        const isActive = index === stepNum
        const isFuture = index > stepNum
        const textColor = isFuture
          ? theme.palette.text.disabled
          : isActive
            ? theme.palette.primary.main
            : theme.palette.text.primary

        return (
          <React.Fragment key={label}>
            <Typography
              sx={{
                fontWeight: isActive ? 600 : 400,
                color: textColor,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {label}
            </Typography>
            {index < steps.length - 1 && (
              <Typography
                sx={{
                  color: theme.palette.text.disabled,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}
              >
                &gt;
              </Typography>
            )}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
