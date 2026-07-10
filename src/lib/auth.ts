import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, requestIp } from '@/lib/rateLimit'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const rateLimit = await checkRateLimit({
          scope: 'credentials-login',
          identifier: requestIp(request),
          limit: 10,
          windowMs: 15 * 60 * 1000,
        })
        if (!rateLimit.allowed) return null

        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        const email = parsed.data.email.trim().toLowerCase()
        const { password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.hashedPassword) return null
        const ok = await bcrypt.compare(password, user.hashedPassword)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') return true

      const googleProfile = profile as { email?: string; email_verified?: boolean } | undefined
      if (!googleProfile?.email || googleProfile.email_verified !== true) {
        return '/login?error=GoogleEmailUnverified'
      }

      return true
    },
    async jwt({ token, user }) {
      const isFreshSignIn = Boolean(user)
      if (user) {
        token.id = user.id
        delete token.sessionVersion
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, sessionVersion: true },
        })
        const tokenVersion = typeof token.sessionVersion === 'number' ? token.sessionVersion : null

        if (!dbUser || (!isFreshSignIn && tokenVersion !== null && tokenVersion !== dbUser.sessionVersion)) {
          delete token.id
          delete token.role
          delete token.sessionVersion
        } else {
          token.role = dbUser.role
          token.sessionVersion = dbUser.sessionVersion
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as { id?: string; role?: string }
        if (token?.id) user.id = token.id as string
        else delete user.id
        if (token?.role) user.role = token.role as string
        else delete user.role
      }
      return session
    },
  },
})
