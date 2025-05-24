// 'use client'
// import { BottomNavigationAction } from '@mui/material'
// import ExitToAppIcon from '@mui/icons-material/ExitToApp'
// import { useRouter } from 'next/navigation'
// import { logout } from './actions'

// export default function LogoutButton() {
//   const router = useRouter()

//   const handleLogout = async () => {
//     await logout()
//     window.sessionStorage.clear()
//     router.push('/login')
//   }

//   return (
//     <BottomNavigationAction
//       label="Logout"
//       icon={<ExitToAppIcon />}
//       onClick={handleLogout}
//       aria-label="Logout"
//     />
//   )
// }
'use client'

import { Button } from '@mui/material'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useRouter } from 'next/navigation'
import { logout } from './actions'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    window.sessionStorage.clear()
    router.push('/login')
  }

  return (
    <Button
      onClick={handleLogout}
      color="inherit"
      startIcon={<ExitToAppIcon />}
      aria-label="Logout"
      sx={{ fontWeight: 'bold', textTransform: 'none' }}
    >
      Logout
    </Button>
  )
}
