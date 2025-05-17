import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import dotenv from "dotenv"
import { SignJWT, jwtVerify } from 'jose'
import { JWT } from "next-auth/jwt";

dotenv.config({path: '@/driver/.env'})

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    async encode({ secret, token, maxAge }) {
      if (!secret || !token || !maxAge) {
        throw new Error("Missing required parameters for JWT encoding");
      }
      const encodedKey = new TextEncoder().encode(`${secret}`);

      return new SignJWT(token)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(encodedKey);
    },
    async decode({
      token,
      secret
    }): Promise<JWT | null> {
      if (!token || !secret) {
        throw new Error("Missing required parameters for JWT decoding");
      }
      const encodedKey = new TextEncoder().encode(`${secret}`);

      try {
        const { payload } = await jwtVerify(token, encodedKey);
        return payload;
      } catch {
        return null;
      }
    },
  }
};