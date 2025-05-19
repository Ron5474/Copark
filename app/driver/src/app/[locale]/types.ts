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
  plate: string
  country: string
  state: string
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
  durationString?: string | null; 
}