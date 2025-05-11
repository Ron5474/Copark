import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { it, expect, afterEach, vi } from 'vitest'

import PermitCard from '@/app/dashboard/permit/Card'

afterEach(() => {
  cleanup()
})

vi.mock('@/app/dashboard/context/Context', () => ({
  useEnforcement: () => ({
    plate: 'ABC123',
    setPlate: vi.fn(),
    setManualInput: vi.fn(),
    setIsValidated: vi.fn(),
    setIsIssuingViolation: vi.fn(),
    permitResult: {
      isValid: true,
      type: 'Residential',
      zone: 'A1',
    },
    setPermitResult: vi.fn(),
  }),
}))

it('displays "Valid Permit" label', () => {
  render(<PermitCard />)

  const validLabel = screen.getByText(/Valid Permit/i)
  expect(validLabel).toBeDefined()
})

// it('displays "Inalid Permit" label', () => {
//     render(
//       <EnforcementProvider initialPlate="XYZ">
//         <PermitCard />
//       </EnforcementProvider>
//     )
  
//     const validLabel = screen.getByText(/Invalid Permit/i)
//     expect(validLabel).toBeDefined()
// })

// it('displays permit type as Residential', () => {
//   render(
//     <EnforcementProvider initialPlate="ABC123">
//       <PermitCard />
//     </EnforcementProvider>
//   )

//   const typeLabel = screen.getByText(/Permit type: Residential/i)
//   expect(typeLabel).toBeDefined()
// })

// it('clicking "Issue Citation" logs issuing message with plate', async () => {
//   const user = userEvent.setup()
//   const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

//   render(
//     <EnforcementProvider initialPlate="XYZ987">
//       <PermitCard />
//     </EnforcementProvider>
//   )

//   const issueButton = screen.getByRole('button', { name: /Issue Citation/i })
//   await user.click(issueButton)

//   expect(logSpy).toHaveBeenCalledWith('Issuing citation for XYZ987')

//   logSpy.mockRestore()
// })
