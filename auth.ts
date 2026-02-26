import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone as string },
        })

        if (user) {
          return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.parentName, // Changed from fatherName
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})