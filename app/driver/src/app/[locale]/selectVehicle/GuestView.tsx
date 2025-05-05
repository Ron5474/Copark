import { Fragment } from 'react'
import type { NextPage } from 'next'

import TopBar from '../shared/Topbar'
import Form from './AddForm'
import Footer from '../shared/Footer'

const View: NextPage = () => {
  return (
    <Fragment>
      <TopBar/>
      <Form/>
      <Footer />
    </Fragment>
  )
}

export default View
