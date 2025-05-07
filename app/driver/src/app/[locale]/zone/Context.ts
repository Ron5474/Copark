// 'use client'

// import {useState, createContext, useEffect} from 'react'


// const ZoneContext = createContext<{
//   currentView: string
//   setCurrentView: React.Dispatch<React.SetStateAction<string>>
// }>({
//   currentView: 'home',
//   setCurrentView: () => {}
// })



// interface ZoneProviderProps {
//   children: React.ReactNode
// }

// function ZoneProvider(props: ZoneProviderProps) {
//   const [currentView, setCurrentView] = useState('home')

//   const value = {
//     currentView, setCurrentView
//   }
//   return (
//     <ZoneContext.Provider value={value}>
//       {props.children}
//     </ZoneContext.Provider>
//   )
// }

// export {ZoneProvider, ZoneContext}
// export default ZoneContext
