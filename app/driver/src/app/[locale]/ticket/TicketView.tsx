/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
'use client'

import {Fragment} from 'react'

import { useTicketState } from './TicketContext'
import TicketList from './TicketList'
import IndividualTicket from './IndividualTicket'

export default function TicketView() {
  const {currentView} = useTicketState()

  return (
    <Fragment>
      {currentView === 'TicketList' ? <TicketList /> : currentView === 'IndividualTicket' ? <IndividualTicket /> : <>Need to Implement</>}
    </Fragment>
  );
}