'use client'

import React, { createContext, useContext, useState } from 'react'

type PermitResult = {
  isValid: boolean
  type: string
  area: string
} | null

type EnforcementContextType = {
  plate: string | null
  setPlate: (plate: string | null) => void
  manualInput: string
  setManualInput: (val: string) => void
  isValidated: boolean
  setIsValidated: (val: boolean) => void
  isIssuingViolation: boolean
  setIsIssuingViolation: (val: boolean) => void
  permitResult: PermitResult
  setPermitResult: (val: PermitResult) => void
  showSuccess: boolean
  setShowSuccess: (val: boolean) => void
}

const EnforcementContext = createContext<EnforcementContextType | undefined>(undefined)

export function EnforcementProvider({
  children,
  initialPlate = null,
  initialManualInput = '',
}: {
  children: React.ReactNode
  initialPlate?: string | null
  initialManualInput?: string
}) {
  const [plate, setPlate] = useState<string | null>(initialPlate)
  const [manualInput, setManualInput] = useState(initialManualInput)
  const [isValidated, setIsValidated] = useState(false)
  const [isIssuingViolation, setIsIssuingViolation] = useState(false)
  const [permitResult, setPermitResult] = useState<PermitResult>(null)
  const [showSuccess, setShowSuccess] = useState(false)


  return (
    <EnforcementContext.Provider
      value={{
        plate,
        setPlate,
        manualInput,
        setManualInput,
        isValidated,
        setIsValidated,
        isIssuingViolation,
        setIsIssuingViolation,
        permitResult,
        setPermitResult,
        showSuccess,
        setShowSuccess,
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
