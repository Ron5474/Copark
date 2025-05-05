import React from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Props for the stepper
// type CustomStepperProps = {
//   steps: string[]
//   activeStep: number
// }

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  flexWrap: 'nowrap',
  overflowX: 'auto', // optional: in case of overflow on small screens
  gap: theme.spacing(1),
}))

const StepLabel = styled(Typography)<{ active?: boolean; index: number; currentStep: number }>(
  ({ theme, active, index, currentStep }) => ({
    fontWeight: active ? 600 : 400,
    color:
      index > currentStep
        ? theme.palette.text.disabled // Future step
        : active
          ? theme.palette.primary.main // Current step
          : theme.palette.text.primary, // Past step
    // textTransform: 'uppercase',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })
);

const Separator = styled('span')(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.85rem',
  flexShrink: 0,
}))

export default function CustomStepper(/*{ steps, activeStep }: CustomStepperProps*/) {
  const steps = ['Zone', 'Duration', 'Vehicle', 'Payment', 'Review']
  const activeStep = 2
  return (
    <StepContainer>
      {steps.map((label, index) => (
        <React.Fragment key={label}>
          <StepLabel
            active={index === activeStep}
            index={index}
            currentStep={activeStep}
          >
            {label}
          </StepLabel>
          {index < steps.length - 1 && <Separator>&gt;</Separator>}
        </React.Fragment>
      ))}

    </StepContainer>
  )
}
