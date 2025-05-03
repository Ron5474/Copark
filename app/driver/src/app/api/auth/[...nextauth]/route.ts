import NextAuth from "next-auth"

// import Facebook from "next-auth/providers/facebook"
// import GitLab from "next-auth/providers/gitlab"
import Google from "next-auth/providers/google"

// if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
//   throw new Error("Missing Google OAuth credentials in environment variables")
// }

export const authOptions = {
  providers: [
//    // Google({
//     //   clientId: process.env.GOOGLE_ID,
//     //   clientSecret: process.env.GOOGLE_SECRET,
//     // }),
    Google({
      clientId: '',
      clientSecret: '',
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }