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

export interface PermitsByDay {
  date: string;
  permits: {
    vehicle: string;
    type: string;
    area: string;
    activeDate: string;
    expireDate: string;
  }[];
}

export interface ChallengedTicket {
  id: string;
  vehicle: string;
  violation: string;
  fine: number;
  ticketStatus: 'challenged';
  issuedDate: string;
  note: string;
  images: string[];
}

export interface Enforcer {
  id: string;
  name: string;
  email: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
}

export interface NewEnforcerInput {
  name: string;
  email: string;
}