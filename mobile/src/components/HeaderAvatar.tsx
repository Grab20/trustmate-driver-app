import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useMyProfile } from '../hooks/useMyProfile'
import { brandColors } from '../theme/theme'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function HeaderAvatar({ href = '/account' }: { href?: string }) {
  const router = useRouter()
  const { data: profile } = useMyProfile()

  return (
    <Pressable onPress={() => router.push(href as never)} style={styles.avatar} hitSlop={10}>
      <Text style={styles.text}>{getInitials(profile?.full_name)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: brandColors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: brandColors.deep,
  },
})
