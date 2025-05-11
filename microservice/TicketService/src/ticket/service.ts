import { Ticket, NewTicket, ModifyTicketInput } from "./schema";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')

export class TicketService {
  private async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }

  private async decrypt(token: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, encodedKey)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt token:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  public async getTickets(): Promise<Ticket[]> {
    const ticketQuery = `
        SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images
        FROM ticket
        WHERE data->>'ticketStatus' != 'deleted'
        ORDER BY data->>'issuedDate';
    `;

    const ticketResults = await pool.query(ticketQuery);

    const tickets: Ticket[] = [];

    for (const row of ticketResults.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: await this.encrypt(row.vehicle),
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
      });

    }

    // console.log(tickets);
    return tickets;
  }

  public async createTicket(newTicket: NewTicket): Promise<Ticket[]> {
    const enforcerId = await this.decrypt(newTicket.enforcer);
    const vehicleId = await this.decrypt(newTicket.vehicle);

    //TODO: Check if the enforcerId and vehicleId are valid, will need services in enforcer and vehicle microservices

    const insertQuery = `
        INSERT INTO ticket (vehicle, enforcer, data)
        VALUES ($1, $2, jsonb_build_object(
            'issuedDate', $3,
            'violation', $4,
            'fine', $5,
            'ticketStatus', $6,
            'images', $7
        ))
        RETURNING id, vehicle, enforcer, 
                  data->>'issuedDate' AS issueddate,
                  data->>'violation' AS violation,
                  data->>'fine' AS fine,
                  data->>'ticketStatus' AS ticketstatus,
                  data->>'images' AS images;
    `;

    const issuedDate = new Date().toISOString();
    const ticketStatus = 'active';

    const result = await pool.query(insertQuery, [
        vehicleId,
        enforcerId,
        issuedDate,
        newTicket.violation,
        newTicket.fine,
        ticketStatus,
        newTicket.images || null,
    ]);

    const row = result.rows[0];

    const ticket: Ticket = {
        id: await this.encrypt(row.id),
        vehicle: await this.encrypt(row.vehicle),
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
    };

    return [ticket];
  }

  public async modifyTicket(input: ModifyTicketInput): Promise<boolean> {
    const { id, ...updates } = input;

    if (!id) {
      throw new Error("Missing ticket ID.");
    }

    // Filter out undefined fields
    const entries = Object.entries(updates).filter(
      ([_, value]) => value !== undefined
    );

    if (entries.length === 0) {
      throw new Error("No fields provided to update.");
    }

    const setFragments = entries.map(([key], idx) =>
      `data = jsonb_set(data, '{${key}}', $${idx + 2}::jsonb, true)`
    );

    const values = entries.map(([_, val]) => JSON.stringify(val));

    const query = {
      text: `
        UPDATE ticket
        SET ${setFragments.join(', ')}
        WHERE id = $1
      `,
      values: [id, ...values]
    };

    const result = await pool.query(query);
  return (result.rowCount ?? 0) > 0;
}

}