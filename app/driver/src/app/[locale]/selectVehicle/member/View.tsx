// /**
//  * @file View.tsx
//  * @description This file contains the view for member vehicle zone checkout.
//  * @author Bryant Oliver
//  */

// import { Fragment, useState } from 'react'
// import type { NextPage } from 'next'
// import { CssBaseline, Box } from '@mui/material'
// import { ThemeProvider } from '@mui/material/styles'

// import ShortTermStepper from '../../zone/ProgressStepper'
// import TopBar from '../../shared/Topbar'
// import MemberVehicles from './Vehicle'
// import Footer from '../../shared/Footer'
// import theme from '../../theme'

// const View: NextPage = () => {
//   const [currentStep, setCurrentStep] = useState('zone')
//   const steps = ['Zone', 'Duration', 'Vehicle', 'Payment', 'Review']

//   return (
//     <Fragment>
//       <CssBaseline />
//       <TopBar/>
//       <Box sx={{ mt: '90px' }}>
//         <ThemeProvider theme={theme}>
//         <ShortTermStepper steps={steps} activeStep={currentStep}/>

//         {(() => {
//           switch (currentStep) {
//             case 'Zone':
//               return <div>Case X</div>
//             case 'Duration':
//               return <div>Case Y</div>
//             case 'Vehicle':
//               return <MemberVehicles isCheckout={true}/>
//             case 'Payment':
//               return <div>Case Y</div>
//             case 'Review':
//               return <div>Case Y</div>
//           }
//         })()}

//         </ThemeProvider>
//       </Box>
//       <Box sx={{position: 'fixed', bottom: 0, width: '100%'}}>
//         <Footer/>
//       </Box>
//     </Fragment>
//   )
// }

// export default View
