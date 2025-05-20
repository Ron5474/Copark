'use client'

import {useState, createContext} from 'react'

import { Vehicle, ZoneDetails, Duration } from '../types'


const steps = ['Zone', 'Duration', 'Vehicle', 'Review', 'Payment']


const ZoneContext = createContext<{
  currentStep: string
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>
  zoneNumber: string
  setZoneNumber: React.Dispatch<React.SetStateAction<string>>
  zoneDetails: ZoneDetails | undefined
  setZoneDetails: React.Dispatch<React.SetStateAction<ZoneDetails | undefined>>
  duration: Duration
  setDuration: React.Dispatch<React.SetStateAction<Duration>>
  durationString: string
  setDurationString: React.Dispatch<React.SetStateAction<string>>
  price: number
  setPrice: React.Dispatch<React.SetStateAction<number>>
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
  duration: {minutes: 0, hours: 0},
  setDuration: () => {},
  durationString: '',
  setDurationString: () => {},
  price: 0.0,
  setPrice: () => {},
  vehicle: undefined,
  setVehicle: () => {},
  next: () => {},
})



interface ZoneProviderProps {
  children: React.ReactNode
  initialZoneDetails?: ZoneDetails
}

function ZoneProvider({ children, initialZoneDetails }: ZoneProviderProps) {
  const [currentStep, setCurrentStep] = useState<string>('Zone')
  const [zoneNumber, setZoneNumber] = useState<string>('')
  const [zoneDetails, setZoneDetails] = useState<ZoneDetails|undefined>(initialZoneDetails)
  const [duration, setDuration] = useState<Duration>({hours: 0, minutes: 0})
  const [durationString, setDurationString] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
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
    duration, setDuration,
    durationString, setDurationString,
    price, setPrice,
    vehicle, setVehicle,
    next,
  }
  return (
    <ZoneContext.Provider value={value}>
      {children}
    </ZoneContext.Provider>
  )
}

export {ZoneProvider, ZoneContext, steps}
export default ZoneContext
