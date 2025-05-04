/*
#######################################################################
#
# Copyright (C) 2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without 
# the express written permission of the copyright holder.
#
#######################################################################
*/
import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'

import Page from '../../src/app/[locale]/login/page'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<Page />)
  expect(await screen.findByText('Log In')).toBeDefined()
})


// it('Successfully Logged In', async () => {
//   const user = userEvent.setup()
//   vi.mocked(login).mockResolvedValue({ name: 'Tommy Thunder' })
//   render(<Page />)

//   const email = screen.getByPlaceholderText('email')
//   await userEvent.type(email, 'foo@bar.com')
//   const passwd = screen.getByPlaceholderText('password')
//   await userEvent.type(passwd, 'secret')
//   await user.click(await screen.findByText('Sign in'))

//   // assert that the nextjs router push function has been called with arg /
//   await vi.waitFor(() => {
//     expect(push).toHaveBeenCalledWith('/')
//   })
// })


