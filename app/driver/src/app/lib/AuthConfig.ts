import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import dotenv from "dotenv"

dotenv.config({path: '@/driver/.env'})


if (!process.env.NEXT_PUBLIC_GOOGLE_ID || !process.env.NEXT_PUBLIC_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials in environment variables")
}

if (!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || !process.env.NEXT_PUBLIC_FACEBOOK_SECRET) {
  throw new Error("Missing Facebook OAuth credentials in environment variables")
}

if (!process.env.NEXT_PUBLIC_GITHUB_ID || !process.env.NEXT_PUBLIC_GITHUB_SECRET) {
  throw new Error("Missing GitHub OAuth credentials in environment variables")
}

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
};