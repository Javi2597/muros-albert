import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { propertyId, propertyRef, source } = await req.json()

  await prisma.lead.create({
    data: {
      name: 'Anónimo (WhatsApp)',
      source: source ?? 'whatsapp',
      propertyId: propertyId ?? null,
      propertyRef: propertyRef ?? null,
    },
  })

  return NextResponse.json({ ok: true })
}
