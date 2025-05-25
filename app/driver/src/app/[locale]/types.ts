export interface User {
  id: string
  name: string
  /**
   * the email address of the user
   * @maxLength 320
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   * @example "user@example.com"
   */
  email: string
  accountStatus: string
}

export interface Vehicle {
  id?: string
  plate: string
  country: string
  state: string
  default?: boolean
  nickname?: string
}

export interface Duration{
  hours: number
  minutes: number
}

export interface ZoneDetails {
  daily?: number
  hourly?: number
  maxDuration?: Duration
  openTime?: string
  closeTime?: string
}

export interface PaymentDetails {
  id: string;
  amount: number|null;
  currency: string|null;
  status: string;
  payment_method: string;
  type: string;
}

export interface PermitDetails {
  type: string;
  zoneNumber: string | null;
  vehicle?: Vehicle;
  duration?: Duration | null; 
}

export type TicketContextType = {
  currentView: string,
  setCurrentView: React.Dispatch<React.SetStateAction<string>>,
  tickets: Ticket[],
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  currentTicket: Ticket | undefined,
  setCurrentTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>,
}

export interface Ticket {
  id: string
  vehicle: string
  enforcer: string
  violation: string
  ticketStatus: string
  issueddate: string
  fine: number
  images: Array<string>
}

export interface Lot {
  name: string
  price: string
}

export interface LotGroup {
  id: string
  title: string
  lots: Lot[]
}