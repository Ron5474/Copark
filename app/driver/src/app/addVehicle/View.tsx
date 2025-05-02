
'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'

import TopBar from '../components/topBar'
import Form from './Form'
import Footer from '../components/footer'

const View: NextPage = () => {
  return (
    <Fragment>
      <TopBar/>
      <Form/>
      <Footer/>
    </Fragment>
  )
}

export default View
