import { supabase } from './supabase'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
}

// Uploaded to a stable per-driver/per-car "draft" path (not tied to an
// inspection id, since none exists yet) so a shot survives even if the
// native camera forces Android to kill the app before the driver reaches
// the final Submit button. Reused across weeks via upsert; useSubmitInspection
// copies these to their permanent per-inspection path at submit time so an
// old inspection's photo_urls never point at a path a later week overwrites.
export async function uploadInspectionDraftPhoto(
  driverId: string,
  carId: string,
  shotKey: string,
  localUri: string,
): Promise<string> {
  const extensionMatch = localUri.match(/\.(\w+)$/)
  const extension = (extensionMatch ? extensionMatch[1] : 'jpg').toLowerCase()
  const path = `${driverId}/draft/${carId}/${shotKey}.${extension}`

  const response = await fetch(localUri)
  const arrayBuffer = await response.arrayBuffer()
  const headerContentType = response.headers.get('content-type')
  const contentType =
    headerContentType && headerContentType !== 'application/octet-stream'
      ? headerContentType
      : (MIME_TYPES[extension] ?? 'application/octet-stream')

  const { error } = await supabase.storage.from('inspection-photos').upload(path, arrayBuffer, {
    contentType,
    upsert: true,
  })

  if (error) throw error
  return path
}
