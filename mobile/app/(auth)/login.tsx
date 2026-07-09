import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Button, HelperText } from 'react-native-paper'
import { useAuthStore } from '../../src/stores/authStore'

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignIn() {
    setError(null)
    setIsSubmitting(true)
    const { error: signInError } = await signIn(email.trim(), password)
    setIsSubmitting(false)
    if (signInError) setError(signInError)
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          TrustMate Driver
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in with the account you used to apply on trustmate.co.za
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          style={styles.input}
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={isSubmitting}
          disabled={isSubmitting || !email || !password}
        >
          Sign In
        </Button>

        <Text variant="bodySmall" style={styles.footnote}>
          Not registered yet? Applications and matching happen on the TrustMate
          website.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
  footnote: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6,
  },
})
