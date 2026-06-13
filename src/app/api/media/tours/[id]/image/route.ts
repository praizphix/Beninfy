import { NextResponse } from 'next/server'
import { parseDataImage } from '@/lib/mediaImage'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tour = await prisma.tour.findUnique({
    where: { id },
    select: { image: true, updatedAt: true },
  })

  const image = parseDataImage(tour?.image)
  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return new NextResponse(image.bytes, {
    headers: {
      'Content-Type': image.contentType,
      'Content-Length': String(image.bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Last-Modified': tour?.updatedAt.toUTCString() ?? new Date().toUTCString(),
    },
  })
}
