import NextAuth from "next-auth"
import dotenv from "dotenv"

// import Facebook from "next-auth/providers/facebook"
// import GitLab from "next-auth/providers/gitlab"
import Google from "next-auth/providers/google"

dotenv.config({path: '@/driver/.env'})

if (!process.env.NEXT_PUBLIC_GOOGLE_ID || !process.env.NEXT_PUBLIC_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials in environment variables")
}

export const authOptions = {
  providers: [
   Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    })
  ]
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
