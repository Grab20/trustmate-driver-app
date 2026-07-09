import { useState } from 'react'
import { Portal, Dialog, TextInput, Button, Text } from 'react-native-paper'

type OdometerDialogProps = {
  visible: boolean
  title: string
  initialValue?: number | null
  onDismiss: () => void
  onConfirm: (odometerKm: number) => void
  confirmLabel?: string
}

export function OdometerDialog({
  visible,
  title,
  initialValue,
  onDismiss,
  onConfirm,
  confirmLabel = 'Confirm',
}: OdometerDialogProps) {
  const [value, setValue] = useState(initialValue != null ? String(initialValue) : '')

  const parsed = Number(value)
  const isValid = value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 12, opacity: 0.7 }}>
            Enter the vehicle's current odometer reading in kilometers.
          </Text>
          <TextInput
            label="Odometer (km)"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button disabled={!isValid} onPress={() => onConfirm(parsed)}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
