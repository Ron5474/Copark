'use client'

import { createContext, useContext, useState } from 'react'

type DetectionMethod = 'camera' | 'manual' | null

type EnforcementContextType = {
  plate: string | null
  setPlate: (plate: string | null) => void
  manualInput: string
  setManualInput: (val: string) => void
  cameraOn: boolean
  setCameraOn: (on: boolean) => void
  capturedImage: string | null
  setCapturedImage: (img: string | null) => void
  detectionMethod: DetectionMethod
  setDetectionMethod: (method: DetectionMethod) => void
  isEditing: boolean
  setIsEditing: (val: boolean) => void
}

const EnforcementContext = createContext<EnforcementContextType | undefined>(undefined)

export function EnforcementProvider({ children }: { children: React.ReactNode }) {
  const [plate, setPlate] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>(null)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <EnforcementContext.Provider value={{
      plate, setPlate,
      manualInput, setManualInput,
      cameraOn, setCameraOn,
      capturedImage, setCapturedImage,
      detectionMethod, setDetectionMethod,
      isEditing, setIsEditing
    }}>
      {children}
    </EnforcementContext.Provider>
  )
}

export function useEnforcement() {
  const ctx = useContext(EnforcementContext)
  if (!ctx) throw new Error('useEnforcement must be used within EnforcementProvider')
  return ctx
}
