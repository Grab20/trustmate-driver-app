import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const SIGNED_URL_TTL_SECONDS = 60 * 10

export function useSignedPhotoUrl(path: string | undefined, bucket: string = 'inspection-photos') {
  return useQuery({
    queryKey: ['signed-photo-url', bucket, path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path as string, SIGNED_URL_TTL_SECONDS)

      if (error) throw error
      return data.signedUrl
    },
    enabled: !!path,
    staleTime: (SIGNED_URL_TTL_SECONDS - 60) * 1000,
  })
}
