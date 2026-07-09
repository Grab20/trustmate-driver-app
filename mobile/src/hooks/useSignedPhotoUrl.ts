import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const SIGNED_URL_TTL_SECONDS = 60 * 10

export function useSignedPhotoUrl(path: string | undefined) {
  return useQuery({
    queryKey: ['inspection-photo-url', path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('inspection-photos')
        .createSignedUrl(path as string, SIGNED_URL_TTL_SECONDS)

      if (error) throw error
      return data.signedUrl
    },
    enabled: !!path,
    staleTime: (SIGNED_URL_TTL_SECONDS - 60) * 1000,
  })
}
