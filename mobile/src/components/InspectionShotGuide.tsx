import { View, StyleSheet } from 'react-native'
import Svg, { Rect, Circle, Path } from 'react-native-svg'
import { Text } from 'react-native-paper'

export type InspectionShotKey = 'front' | 'back' | 'left' | 'right' | 'interior' | 'dashboard'

const INSTRUCTIONS: Record<InspectionShotKey, string> = {
  front: 'Stand back about 2m. Center the car and include the full front bumper and number plate.',
  back: 'Stand back about 2m. Center the car and include the full rear bumper and number plate.',
  left: 'Stand to the side, far enough back to fit the whole car from front to back in frame.',
  right: 'Stand to the side, far enough back to fit the whole car from front to back in frame.',
  interior: 'Open the driver door and photograph the seats and floor area.',
  dashboard: 'Sit in the driver seat and photograph the dashboard, steering wheel, and odometer.',
}

function FrontBackDiagram() {
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      <Rect x="20" y="20" width="80" height="55" rx="10" fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Circle cx="35" cy="78" r={6} fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Circle cx="85" cy="78" r={6} fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Rect x="35" y="30" width="50" height="14" rx="3" fill="none" stroke="#0F5C4F" strokeWidth={1.5} />
    </Svg>
  )
}

function SideDiagram() {
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      <Path
        d="M15 65 Q15 45 35 42 L45 30 L80 30 L95 42 Q105 45 105 65 Z"
        fill="none"
        stroke="#0F5C4F"
        strokeWidth={2}
      />
      <Circle cx="35" cy="70" r={8} fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Circle cx="90" cy="70" r={8} fill="none" stroke="#0F5C4F" strokeWidth={2} />
    </Svg>
  )
}

function InteriorDiagram() {
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      <Rect x="15" y="20" width="90" height="60" rx="8" fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Rect x="30" y="55" width="25" height="20" rx="4" fill="none" stroke="#0F5C4F" strokeWidth={1.5} />
      <Rect x="65" y="55" width="25" height="20" rx="4" fill="none" stroke="#0F5C4F" strokeWidth={1.5} />
    </Svg>
  )
}

function DashboardDiagram() {
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      <Rect x="15" y="45" width="90" height="25" rx="6" fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Circle cx="35" cy="75" r={14} fill="none" stroke="#0F5C4F" strokeWidth={2} />
      <Circle cx="35" cy="75" r={4} fill="none" stroke="#0F5C4F" strokeWidth={1.5} />
    </Svg>
  )
}

const DIAGRAMS: Record<InspectionShotKey, () => React.JSX.Element> = {
  front: FrontBackDiagram,
  back: FrontBackDiagram,
  left: SideDiagram,
  right: SideDiagram,
  interior: InteriorDiagram,
  dashboard: DashboardDiagram,
}

export function InspectionShotGuide({ shotKey }: { shotKey: InspectionShotKey }) {
  const Diagram = DIAGRAMS[shotKey]
  return (
    <View style={styles.container}>
      <Diagram />
      <Text variant="bodySmall" style={styles.instruction}>
        {INSTRUCTIONS[shotKey]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  instruction: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
})
