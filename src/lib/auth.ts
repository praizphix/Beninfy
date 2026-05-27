import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.hashedPassword) return null
        const ok = await bcrypt.compare(password, user.hashedPassword)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // role is set on credentials sign in; for OAuth, fetch from DB
        if ('role' in user && user.role) {
          token.role = user.role as string
        } else if (user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { role: true } })
          if (dbUser) token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) session.user.id = token.id as string
      if (token?.role && session.user) (session.user as { role?: string }).role = token.role as string
      return session
    },
  },
})
