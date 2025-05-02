import { SignJWT, jwtVerify } from 'jose'
import { Credentials, User, SessionUser } from './'
import { pool } from '../db'

const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET)

export async function authenticate(credentials: Credentials): Promise<User|undefined> {
  const query = {
    text: `
      SELECT jsonb_build_object(
        'id', id,
        'name', data->>'name',
        'email', data->>'email'
      ) AS user
      FROM member
      WHERE data->>'email' = $1
      AND data->>'pwhash' = crypt($2::text, data->>'pwhash')
      AND (data->>'deleted' IS NULL OR data->>'deleted' != 'true');
    `,
    values: [credentials.email, credentials.password]
  }

  const { rows } = await pool.query(query)

  if (rows.length > 0) {
    const user = rows[0].user
    return { id: await user.id, name: user.name }
  } else {
    return undefined
  }
}

export async function encrypt(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(encodedKey)
}

export async function decrypt(token: string | undefined = ''): Promise<string> {
  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ['HS256']
  })
  return payload.id + ''
}

const encodedKeyOut = new TextEncoder().encode(process.env.MASTER_SECRET + 'apiexit');

export async function encryptOut(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(encodedKeyOut)
}

export async function decryptOut(token: string | undefined = ''): Promise<string> {
  const { payload } = await jwtVerify(token, encodedKeyOut, {
    algorithms: ['HS256']
  })
  return payload.id + ''
}

export async function check(token: string|undefined, scopes?: string[]): Promise<SessionUser> {
  const payload = await decrypt(token)

  const userQuery = {
    text: `SELECT jsonb_build_object(
             'id', id,
             'roles', data->'roles',
             'deleted', data->'deleted'
           ) AS user
           FROM member
           WHERE id = $1;`,
    values: [payload],
  }

  const { rows } = await pool.query(userQuery)
  if (rows.length === 0) throw new Error("Unauthorized")

  const user = rows[0].user
  const userRoles: string[] = user.roles

  if (user.deleted) throw new Error("Unauthorized")

  if (scopes && !scopes.some(scope => userRoles.includes(scope))) {
    throw new Error("Unauthorized")
  }

  return { id: user.id }
}
