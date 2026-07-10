require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') })
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  const accounts = await prisma.account.findMany({ where: { provider: 'google' }, include: { user: true } })
  let changed = 0
  for (const a of accounts) {
    if (a.user && a.user.role !== 'user') {
      console.log('Fixing user', a.user.email, 'from', a.user.role, 'to user')
      await prisma.user.update({ where: { id: a.userId }, data: { role: 'user' } })
      changed++
    }
  }
  console.log('Changed:', changed)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
