
'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'

import TopBar from '../shared/topBar'
import Form from './AddForm'
import Footer from '../shared/footer'

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
