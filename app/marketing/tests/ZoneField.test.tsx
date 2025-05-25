import { vi, it, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import ZoneField from '../src/app/[locale]/components/ZoneField'


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
  
  it('Renders Zone Field', async () => {
    render(<ZoneField text = {`Hello`}/>)
    await screen.findByText('Hello')
  })