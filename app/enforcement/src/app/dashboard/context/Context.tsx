'use client'

import React, { createContext, useContext, useState } from 'react'

type PermitResult = [{
  type: string
  area: string
}] | null

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
  title: string
  setTitle: (val: string) => void
}

const EnforcementContext = createContext<EnforcementContextType | undefined>(undefined)

export function EnforcementProvider({
  children,
  initialPlate = null,
  initialManualInput = '',
  initialShowSuccess = false,
  initialIsValidated = false,
  initialIsIssuingViolation = false,
}: {
  children: React.ReactNode
  initialPlate?: string | null
  initialManualInput?: string
  initialShowSuccess?: boolean
  initialIsValidated?: boolean
  initialIsIssuingViolation?: boolean
}) {
  const [plate, setPlate] = useState<string | null>(initialPlate)
  const [manualInput, setManualInput] = useState(initialManualInput)
  const [isValidated, setIsValidated] = useState(initialIsValidated)
  const [isIssuingViolation, setIsIssuingViolation] = useState(initialIsIssuingViolation)
  const [permitResult, setPermitResult] = useState<PermitResult>(null)
  const [showSuccess, setShowSuccess] = useState(initialShowSuccess)
  const [title, setTitle] = useState('Dashboard')


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
        title,
        setTitle,
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
