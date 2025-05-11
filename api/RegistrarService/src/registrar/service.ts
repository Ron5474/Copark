import { SignJWT } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
export class RegistrarService {
  public async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(internalKey)
  }

  public async hasOutstandingTickets(email: string): Promise<boolean> {
    const token = await this.encrypt("admin"); // Use admin token since we're querying as admin

    const query = `
      query GetUserTickets($email: String!) {
        getUserTickets(email: $email) {
          ticketStatus
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:4002/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query,
          variables: { email }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.getUserTickets.some(
        (ticket: { ticketStatus: string }) => ticket.ticketStatus === 'unpaid'
      );

    } catch (error) {
      console.error('Error checking tickets:', error);
      throw error;
    }
  }
}