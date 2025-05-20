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

export interface NewUser {
  name: string;
  /**
   * the email address of the user
   * @maxLength 320
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   * @example "user@example.com"
   */
  email: string;
}

export interface Ticket {
  id: string
  vehicle: string
  enforcer: string
  issuedDate: Date
  violation: string
  fine: number
  ticketStatus: string
  images?: string
  note?: string
}
