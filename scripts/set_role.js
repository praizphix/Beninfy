require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') })
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  const email = 'crpbenin66@gmail.com'
  const role = 'admin'
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('User not found:', email)
    return
  }
  await prisma.user.update({ where: { id: user.id }, data: { role } })
  console.log('Updated', email, 'to role', role)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
