import NextAuth from "next-auth"
import dotenv from "dotenv"

import Facebook from "next-auth/providers/facebook"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

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

export const authOptions = {
  providers: [
   Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_SECRET,
    }),
    GitHub({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET,
      authorization: {
        params: {
          scope: "email public_profile", // Make sure it's valid
        },
      },
    }),
  ]
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
