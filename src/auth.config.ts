import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const authConfig = {
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // user object from PrismaAdapter has the DB fields
        token.createdAt = (user as any).createdAt
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.createdAt = (token.createdAt as Date | string)?.toString() || ""
      }
      return session
    },
  },
} satisfies NextAuthConfig
