import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { name, email, phone, message, propertyId, propertyRef, source } = await req.json()

  await prisma.lead.create({
    data: {
      // Los clics de WhatsApp llegan sin nombre → quedan como anónimos;
      // el formulario de la home sí envía nombre/email/mensaje.
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Anónimo (WhatsApp)',
      email: typeof email === 'string' && email.trim() ? email.trim() : null,
      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      message: typeof message === 'string' && message.trim() ? message.trim() : null,
      source: source ?? 'whatsapp',
      propertyId: propertyId ?? null,
      propertyRef: propertyRef ?? null,
    },
  })

  return NextResponse.json({ ok: true })
}
