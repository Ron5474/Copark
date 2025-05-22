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

import {TicketProvider} from './TicketContext'
import TicketView from './TicketView';

export default function TicketPage() {
  return (
    <TicketProvider>
      <TicketView />
    </TicketProvider>
  );
}