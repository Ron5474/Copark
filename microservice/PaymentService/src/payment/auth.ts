
import { SessionUser } from "../index";

// const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET);

export class AuthService {
  public async check(authHeader?: string, scopes?: string[]): Promise<SessionUser> {
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized");
    }

    try {
      const user = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      const userData = await user.json();
      if (!userData) {
        throw new Error("Unauthorized");
      }

      if (scopes && !scopes.includes(userData.role[0])) {
        throw new Error("Unauthorized");
      }
  
      return {id: userData.id};
    } catch {
      throw new Error("Unauthorized");
    }
  }
}