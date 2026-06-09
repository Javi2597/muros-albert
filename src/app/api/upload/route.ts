import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Genera una firma para upload directo a Cloudinary desde el cliente.
 *
 * Flujo:
 * 1. El cliente pide la firma a este endpoint (POST)
 * 2. El cliente sube la imagen DIRECTAMENTE a Cloudinary con la firma
 * 3. Cloudinary devuelve { public_id, secure_url, … }
 * 4. El cliente guarda esos datos en el formulario y los envía al Server Action
 *
 * Ventaja: las imágenes no pasan por nuestro servidor → sin límite de tamaño
 *          y sin consumo de ancho de banda propio.
 */
export async function POST(request: Request) {
  const { folder = 'albert-inmo/propiedades' } = await request.json().catch(() => ({}))

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary no configurado' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)

  // Los parámetros deben estar en orden alfabético para la firma
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash('sha256')
    .update(paramsToSign + apiSecret)
    .digest('hex')

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder })
}
