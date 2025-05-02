"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("./db");
const jose_1 = require("jose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET);
class AuthService {
    async authenticate(credentials) {
        const query = {
            text: `
        SELECT jsonb_build_object(
          'id', id,
          'name', data->>'name',
          'email', data->>'email'
        ) AS user
        FROM account
        WHERE data->>'email' = $1
        AND data->>'pwhash' = crypt($2::text, data->>'pwhash')
        AND (data->>'deleted' IS NULL OR data->>'deleted' != 'true');
      `,
            values: [credentials.email, credentials.password]
        };
        const { rows } = await db_1.pool.query(query);
        if (rows.length > 0) {
            const user = rows[0].user;
            return { id: await user.id, name: user.name };
        }
        else {
            return undefined;
        }
    }
    async encrypt(userId) {
        return new jose_1.SignJWT({ id: userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30m')
            .sign(encodedKey);
    }
    async getUserById(id) {
        const query = {
            text: "SELECT id, data as data FROM account WHERE id = $1 AND data->>'deleted' IS NULL",
            values: [id],
        };
        const res = await db_1.pool.query(query);
        if (res.rows.length === 0) {
            return undefined;
        }
        else {
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
    async check(authHeader, scopes) {
        return new Promise((resolve, reject) => {
            if (!authHeader) {
                reject(new Error("Unauthorized"));
            }
            else {
                const token = authHeader.split(" ")[1];
                jsonwebtoken_1.default.verify(token, `${process.env.MASTER_SECRET}`, async (err, decoded) => {
                    const uid = decoded;
                    if (err) {
                        reject(err);
                    }
                    else {
                        const user = await this.getUserById(uid.id);
                        if (user) {
                            if (scopes) {
                                if (!user.roles ||
                                    !scopes.some((role) => user.roles.includes(role))) {
                                    reject(new Error("Unauthorized"));
                                }
                            }
                            resolve({ id: user.id });
                        }
                        reject(new Error("Unauthorized"));
                    }
                });
            }
        });
    }
}
exports.AuthService = AuthService;
