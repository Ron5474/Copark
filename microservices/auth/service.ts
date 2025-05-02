
import { SessionUser } from "../server";
import { AuthUser } from "./index";
import { pool } from "./db";
import jwt from "jsonwebtoken";

export class AuthService {
  private async getUserById(id: string): Promise<AuthUser | undefined> {
    const query = {
      text: "SELECT id, data as data FROM member WHERE id = $1 AND data->>'deleted' IS NULL",
      values: [id],
    };

    const res = await pool.query(query);
    if (res.rows.length === 0) {
      return undefined;
    } else {
      const user = res.rows[0];
      const data = user.data;
      return {
        id: user.id,
        name: data.name,
        email: data.email,
        roles: data.roles,
      };
    }
  }

  public async check(
    authHeader?: string,
    scopes?: string[]
  ): Promise<SessionUser> {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorized"));
      } else {
        const token = authHeader.split(" ")[1];
        jwt.verify(
          token,
          `${process.env.MASTER_SECRET}`,
          async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const uid = decoded as SessionUser;
            if (err) {
              reject(err);
            } else {
              const user = await this.getUserById(uid.id);
              if (user) {
                if (scopes) {
                  if (
                    !user.roles ||
                    !scopes.some((role) => user.roles.includes(role))
                  ) {
                    // CREDITS: TO ALLOW FOR MULTIPLE SCOPES https://chatgpt.com/c/67f1d214-c684-8007-b007-ab0547bad07c
                    reject(new Error("Unauthorized"));
                  }
                }
                resolve({ id: user.id });
              }
              reject(new Error("Unauthorized"));
            }
          }
        );
      }
    });
  }
}