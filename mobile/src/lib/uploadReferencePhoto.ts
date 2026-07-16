import { supabase } from './supabase'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
}

export async function uploadReferencePhoto(carId: string, shotKey: string, localUri: string): Promise<string> {
  const extensionMatch = localUri.match(/\.(\w+)$/)
  const extension = (extensionMatch ? extensionMatch[1] : 'jpg').toLowerCase()
  const path = `${carId}/${shotKey}.${extension}`

  const response = await fetch(localUri)
  const arrayBuffer = await response.arrayBuffer()
  const headerContentType = response.headers.get('content-type')
  const contentType =
    headerContentType && headerContentType !== 'application/octet-stream'
      ? headerContentType
      : (MIME_TYPES[extension] ?? 'application/octet-stream')

  const { error } = await supabase.storage.from('car-reference-photos').upload(path, arrayBuffer, {
    contentType,
    upsert: true,
  })

  if (error) throw error
  return path
}
