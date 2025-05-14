
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
      console.log("Creating payment session for item:");
      const user = await fetch('http://localhost:3010/api/v0/auth/driver/id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      console.log("User data:", await user.json());
      console.log(scopes);
      return {id: 'aaaaaa'}
    } catch {
      throw new Error("Unauthorized");
    }
  }
}