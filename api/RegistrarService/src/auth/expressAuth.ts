import { Request } from "express";

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    // Call AuthService to validate the token
    return fetch('http://localhost:3010/api/v0/auth/check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scopes)
    }).then(async (response) => {
      if (response.status !== 200) {
        throw new Error('Unauthorized');
      }
      return response.json();
    });
  }
  
  return Promise.reject(new Error("Invalid security name"));
}