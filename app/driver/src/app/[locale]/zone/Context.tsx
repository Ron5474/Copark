'use client'

import {useState, createContext} from 'react'

import { Vehicle, ZoneDetails } from '../types'


const steps = ['Zone', 'Duration', 'Vehicle', 'Review', 'Payment']


const ZoneContext = createContext<{
  currentStep: string
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>
  zoneNumber: string
  setZoneNumber: React.Dispatch<React.SetStateAction<string>>
  zoneDetails: ZoneDetails | undefined
  setZoneDetails: React.Dispatch<React.SetStateAction<ZoneDetails | undefined>>
  vehicle: Vehicle | undefined
  setVehicle: React.Dispatch<React.SetStateAction<Vehicle | undefined>>
  next: () => void
}>({
  currentStep: 'Zone',
  setCurrentStep: () => {},
  zoneNumber: '',
  setZoneNumber: () => {},
  zoneDetails: undefined,
  setZoneDetails: () => {},
  vehicle: undefined,
  setVehicle: () => {},
  next: () => {},
})



interface ZoneProviderProps {
  children: React.ReactNode
}

function ZoneProvider(props: ZoneProviderProps) {
  const [currentStep, setCurrentStep] = useState<string>('Zone')
  const [zoneNumber, setZoneNumber] = useState<string>('')
  const [zoneDetails, setZoneDetails] = useState<ZoneDetails|undefined>(undefined)
  const [vehicle, setVehicle] = useState<Vehicle|undefined>(undefined)

  const next = () => {
    const index = steps.indexOf(currentStep)
    if (index < steps.length - 1) {
      setCurrentStep(steps[index + 1])
    }
  }


  const value = {
    currentStep, setCurrentStep,
    zoneNumber, setZoneNumber,
    zoneDetails, setZoneDetails,
    vehicle, setVehicle,
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
