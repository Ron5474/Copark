'use client'

import React, { createContext, useContext, useState } from 'react'

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
  isValidated: boolean
  setIsValidated: (val: boolean) => void
  isIssuingViolation: boolean
  setIsIssuingViolation: (val: boolean) => void
}

const EnforcementContext = createContext<EnforcementContextType | undefined>(undefined)

export function EnforcementProvider({
  children,
  initialPlate = null,
  initialManualInput = '',
  initialCameraOn = false,
  initialCapturedImage = null,
  initialDetectionMethod = null,
  initialIsEditing = false,
}: {
  children: React.ReactNode
  initialPlate?: string | null
  initialManualInput?: string
  initialCameraOn?: boolean
  initialCapturedImage?: string | null
  initialDetectionMethod?: DetectionMethod
  initialIsEditing?: boolean
}) {
  const [plate, setPlate] = useState<string | null>(initialPlate)
  const [manualInput, setManualInput] = useState(initialManualInput)
  const [cameraOn, setCameraOn] = useState(initialCameraOn)
  const [capturedImage, setCapturedImage] = useState<string | null>(initialCapturedImage)
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>(initialDetectionMethod)
  const [isEditing, setIsEditing] = useState(initialIsEditing)
  const [isValidated, setIsValidated] = useState(false)
  const [isIssuingViolation, setIsIssuingViolation] = useState(false)

  return (
    <EnforcementContext.Provider
      value={{
        plate,
        setPlate,
        manualInput,
        setManualInput,
        cameraOn,
        setCameraOn,
        capturedImage,
        setCapturedImage,
        detectionMethod,
        setDetectionMethod,
        isEditing,
        setIsEditing,
        isValidated,
        setIsValidated,
        isIssuingViolation,
        setIsIssuingViolation,
      }}
    >
      {children}
    </EnforcementContext.Provider>
  )
}


export function useEnforcement() {
  const ctx = useContext(EnforcementContext)
  if (!ctx) throw new Error('useEnforcement must be used within EnforcementProvider')
  return ctx
}
