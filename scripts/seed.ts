/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { vehicles } from '../src/data/vehicles'
import { routes } from '../src/data/routes'
import { tours } from '../src/data/tours'
import { borderFees } from '../src/data/borderFees'
import { fleetInventory } from '../src/data/fleetInventory'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding vehicles…')
  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {
        name: v.name,
        nameFr: v.nameFr ?? null,
        capacity: v.capacity,
        luggageCapacity: v.luggageCapacity ?? 0,
        available: v.available ?? true,
        image: v.image ?? null,
        description: v.description ?? null,
        descriptionFr: v.descriptionFr ?? null,
        badge: v.badge ?? null,
        badgeFr: v.badgeFr ?? null,
        features: v.features ?? [],
        featuresFr: v.featuresFr ?? [],
      },
      create: {
        id: v.id,
        name: v.name,
        nameFr: v.nameFr ?? null,
        capacity: v.capacity,
        luggageCapacity: v.luggageCapacity ?? 0,
        available: v.available ?? true,
        image: v.image ?? null,
        description: v.description ?? null,
        descriptionFr: v.descriptionFr ?? null,
        badge: v.badge ?? null,
        badgeFr: v.badgeFr ?? null,
        features: v.features ?? [],
        featuresFr: v.featuresFr ?? [],
      },
    })
  }

  console.log('Seeding fleet units…')
  for (const unit of fleetInventory) {
    await prisma.fleetVehicle.upsert({
      where: { id: unit.id },
      update: {
        vehicleId: unit.vehicleId,
        label: unit.label,
        currentCity: unit.currentCity,
        notes: unit.notes,
      },
      create: {
        id: unit.id,
        vehicleId: unit.vehicleId,
        label: unit.label,
        plateNumber: unit.plateNumber,
        status: 'available',
        currentCity: unit.currentCity,
        notes: unit.notes,
      },
    })
  }

  console.log('Seeding routes…')
  for (const r of routes) {
    await prisma.route.upsert({
      where: { id: r.id },
      update: {
        from: r.from,
        fromCode: r.fromCode,
        fromCountry: r.fromCountry,
        to: r.to,
        toCode: r.toCode,
        toCountry: r.toCountry,
        durationHours: r.durationHours,
        popular: r.popular,
        image: r.image,
        description: r.description,
        descriptionFr: r.descriptionFr,
        borderCrossings: r.borderCrossings ?? [],
      },
      create: {
        id: r.id,
        from: r.from,
        fromCode: r.fromCode,
        fromCountry: r.fromCountry,
        to: r.to,
        toCode: r.toCode,
        toCountry: r.toCountry,
        durationHours: r.durationHours,
        popular: r.popular,
        image: r.image,
        description: r.description,
        descriptionFr: r.descriptionFr,
        borderCrossings: r.borderCrossings ?? [],
      },
    })
  }

  console.log('Seeding tours…')
  for (const t of tours as any[]) {
    await prisma.tour.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        titleFr: t.titleFr ?? null,
        destination: t.destination ?? null,
        destinationFr: t.destinationFr ?? null,
        country: t.country,
        countryFr: t.countryFr ?? null,
        durationDays: t.durationDays,
        startingFromNGN: t.startingFromNGN,
        image: t.image ?? null,
        description: t.description,
        descriptionFr: t.descriptionFr ?? null,
        highlights: t.highlights ?? [],
        highlightsFr: t.highlightsFr ?? [],
      },
      create: {
        id: t.id,
        title: t.title,
        titleFr: t.titleFr ?? null,
        destination: t.destination ?? null,
        destinationFr: t.destinationFr ?? null,
        country: t.country,
        countryFr: t.countryFr ?? null,
        durationDays: t.durationDays,
        startingFromNGN: t.startingFromNGN,
        image: t.image ?? null,
        description: t.description,
        descriptionFr: t.descriptionFr ?? null,
        highlights: t.highlights ?? [],
        highlightsFr: t.highlightsFr ?? [],
      },
    })
  }

  console.log('Seeding border fees…')
  for (const b of borderFees as any[]) {
    await prisma.borderFee.upsert({
      where: { id: b.id },
      update: {
        country: b.country,
        countryFr: b.countryFr ?? null,
        border: b.border,
        borderFr: b.borderFr ?? null,
        countries: b.countries ?? [],
        feePerPersonNGN: b.feePerPersonNGN,
        feeRoundTripNGN: b.feeRoundTripNGN,
        popular: b.popular ?? false,
        icon: b.icon ?? null,
        services: b.services ?? [],
        servicesFr: b.servicesFr ?? [],
        documents: b.documents ?? [],
        documentsFr: b.documentsFr ?? [],
        tips: b.tips ?? [],
        tipsFr: b.tipsFr ?? [],
      },
      create: {
        id: b.id,
        country: b.country,
        countryFr: b.countryFr ?? null,
        border: b.border,
        borderFr: b.borderFr ?? null,
        countries: b.countries ?? [],
        feePerPersonNGN: b.feePerPersonNGN,
        feeRoundTripNGN: b.feeRoundTripNGN,
        popular: b.popular ?? false,
        icon: b.icon ?? null,
        services: b.services ?? [],
        servicesFr: b.servicesFr ?? [],
        documents: b.documents ?? [],
        documentsFr: b.documentsFr ?? [],
        tips: b.tips ?? [],
        tipsFr: b.tipsFr ?? [],
      },
    })
  }

  // Promote configured super admin email if it exists
  const superAdminEmail = process.env.ADMIN_EMAIL ?? 'info@beninfy.com'
  const promoted = await prisma.user.updateMany({
    where: { email: superAdminEmail },
    data: { role: 'super_admin' },
  })
  console.log(`Super-admin promotion: ${promoted.count} user(s) updated for ${superAdminEmail}`)

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
