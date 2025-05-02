
'use client'

import { Fragment } from 'react'
import type { NextPage } from 'next'

import TopBar from '../components/topBar'
import Form from './Form'

const View: NextPage = () => {
  return (
    <Fragment>
      <TopBar/>
      <Form/>
    </Fragment>
  )
}

export default View
