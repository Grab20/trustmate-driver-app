import { supabase } from './supabase'

export async function uploadInspectionPhoto(
  driverId: string,
  inspectionId: string,
  localUri: string,
  index: number,
): Promise<string> {
  const extensionMatch = localUri.match(/\.(\w+)$/)
  const extension = extensionMatch ? extensionMatch[1] : 'jpg'
  const path = `${driverId}/${inspectionId}/${index}.${extension}`

  const response = await fetch(localUri)
  const arrayBuffer = await response.arrayBuffer()

  const { error } = await supabase.storage
    .from('inspection-photos')
    .upload(path, arrayBuffer, {
      contentType: response.headers.get('content-type') ?? `image/${extension}`,
      upsert: true,
    })

  if (error) throw error
  return path
}
