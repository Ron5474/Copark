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
      clientId: '512602013845-tir6qaf1v2cf1q51a7prq26cbf6ge37p.apps.googleusercontent.com',
      clientSecret: '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',
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }