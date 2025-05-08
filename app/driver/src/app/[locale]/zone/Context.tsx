'use client'

import {useState, createContext} from 'react'


const steps = ['Zone', 'Duration', 'Vehicle', 'Payment', 'Review']


const ZoneContext = createContext<{
  currentStep: string
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>
  zoneNumber: string
  setZoneNumber: React.Dispatch<React.SetStateAction<string>>
  next: () => void
}>({
  currentStep: 'Zone',
  setCurrentStep: () => {},
  zoneNumber: '',
  setZoneNumber: () => {},
  next: () => {},
})



interface ZoneProviderProps {
  children: React.ReactNode
}

function ZoneProvider(props: ZoneProviderProps) {
  const [currentStep, setCurrentStep] = useState('Zone')
  const [zoneNumber, setZoneNumber] = useState('')

  const next = () => {
    const index = steps.indexOf(currentStep)
    if (index < steps.length - 1) {
      setCurrentStep(steps[index + 1])
    }
  }


  const value = {
    currentStep, setCurrentStep,
    zoneNumber, setZoneNumber,
    next,
  }
  return (
    <ZoneContext.Provider value={value}>
      {props.children}
    </ZoneContext.Provider>
  )
}

export {ZoneProvider, ZoneContext, steps}
export default ZoneContext
