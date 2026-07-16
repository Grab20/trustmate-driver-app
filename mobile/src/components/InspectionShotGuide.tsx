import { View, StyleSheet } from 'react-native'
import Svg, { Rect, Circle, Path, Ellipse, Line } from 'react-native-svg'
import { Text } from 'react-native-paper'
import { brandColors } from '../theme/theme'

export type InspectionShotKey =
  | 'front'
  | 'front_corner'
  | 'passenger_side'
  | 'rear'
  | 'driver_corner'
  | 'driver_side'
  | 'dashboard'
  | 'front_seats'
  | 'boot'

export const EXTERIOR_SHOT_KEYS: InspectionShotKey[] = [
  'front',
  'front_corner',
  'passenger_side',
  'rear',
  'driver_corner',
  'driver_side',
]

export const INTERIOR_SHOT_KEYS: InspectionShotKey[] = ['dashboard', 'front_seats', 'boot']

export const SHOT_LABELS: Record<InspectionShotKey, string> = {
  front: 'Front',
  front_corner: 'Front Corner',
  passenger_side: 'Passenger Side',
  rear: 'Rear',
  driver_corner: 'Driver Corner',
  driver_side: 'Driver Side',
  dashboard: 'Dashboard',
  front_seats: 'Front Seats',
  boot: 'Boot / Trunk',
}

export const INSTRUCTIONS: Record<InspectionShotKey, string> = {
  front: 'Stand back about 2m directly in front of the car, and include the full bumper and number plate.',
  front_corner: 'Stand at the front corner, angled so both the front and one side of the car are visible.',
  passenger_side: 'Stand to the passenger side, far enough back to fit the whole car from front to back.',
  rear: 'Stand back about 2m directly behind the car, and include the full bumper and number plate.',
  driver_corner: 'Stand at the rear corner on the driver side, angled so both the rear and side are visible.',
  driver_side: 'Stand to the driver side, far enough back to fit the whole car from front to back.',
  dashboard: 'Sit in the driver seat and photograph the dashboard, steering wheel, and odometer.',
  front_seats: 'Open the driver door and photograph the front seats and floor area.',
  boot: 'Open the boot/trunk and photograph the inside, empty and clearly lit.',
}

function FrontBackDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Ellipse cx="70" cy="92" rx="48" ry="7" fill="#00000012" />
      <Rect x="25" y="24" width="90" height="58" rx="14" fill={brandColors.mintGreen} stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Rect x="42" y="34" width="56" height="16" rx="4" fill="#fff" opacity={0.85} />
      <Circle cx="42" cy="84" r={9} fill={brandColors.darkGreen} />
      <Circle cx="98" cy="84" r={9} fill={brandColors.darkGreen} />
      <Circle cx="42" cy="84" r={3.5} fill="#EAEAE5" />
      <Circle cx="98" cy="84" r={3.5} fill="#EAEAE5" />
      <Rect x="55" y="66" width="30" height="8" rx="2" fill="#fff" />
    </Svg>
  )
}

function SideDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Ellipse cx="70" cy="92" rx="55" ry="7" fill="#00000012" />
      <Path
        d="M15 78 Q13 52 38 48 L52 30 L95 30 L118 48 Q127 52 125 78 Z"
        fill={brandColors.mintGreen}
        stroke={brandColors.darkGreen}
        strokeWidth={2.5}
      />
      <Path d="M55 33 L48 48 L92 48 L88 33 Z" fill="#fff" opacity={0.85} />
      <Circle cx="42" cy="80" r={11} fill={brandColors.darkGreen} />
      <Circle cx="100" cy="80" r={11} fill={brandColors.darkGreen} />
      <Circle cx="42" cy="80" r={4.5} fill="#EAEAE5" />
      <Circle cx="100" cy="80" r={4.5} fill="#EAEAE5" />
    </Svg>
  )
}

function CornerDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Ellipse cx="72" cy="92" rx="55" ry="7" fill="#00000012" />
      <Path
        d="M20 80 Q18 55 42 50 L54 32 L88 30 L112 44 Q124 50 122 80 Z"
        fill={brandColors.mintGreen}
        stroke={brandColors.darkGreen}
        strokeWidth={2.5}
      />
      <Path d="M58 35 L50 50 L86 48 L84 33 Z" fill="#fff" opacity={0.85} />
      <Circle cx="46" cy="82" r={10} fill={brandColors.darkGreen} />
      <Circle cx="104" cy="82" r={10} fill={brandColors.darkGreen} />
      <Circle cx="46" cy="82" r={4} fill="#EAEAE5" />
      <Circle cx="104" cy="82" r={4} fill="#EAEAE5" />
    </Svg>
  )
}

function InteriorDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Rect x="18" y="16" width="104" height="78" rx="12" fill="#F4F7F5" stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Rect x="30" y="52" width="34" height="30" rx="6" fill={brandColors.green} opacity={0.85} />
      <Rect x="76" y="52" width="34" height="30" rx="6" fill={brandColors.green} opacity={0.85} />
      <Line x1="30" y1="30" x2="110" y2="30" stroke={brandColors.darkGreen} strokeWidth={1.5} opacity={0.4} />
    </Svg>
  )
}

function DashboardDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Rect x="18" y="55" width="104" height="30" rx="10" fill={brandColors.darkGreen} />
      <Circle cx="42" cy="90" r={18} fill="#fff" stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Circle cx="42" cy="90" r={5} fill={brandColors.green} />
      <Rect x="70" y="62" width="38" height="14" rx="3" fill={brandColors.mintGreen} />
      <Circle cx="78" cy="69" r={2} fill={brandColors.darkGreen} />
      <Circle cx="90" cy="69" r={2} fill={brandColors.darkGreen} />
      <Circle cx="102" cy="69" r={2} fill={brandColors.darkGreen} />
    </Svg>
  )
}

function BootDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Rect x="20" y="34" width="100" height="60" rx="10" fill="#F4F7F5" stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Path d="M20 34 L38 12 L122 12 L120 34 Z" fill={brandColors.mintGreen} stroke={brandColors.darkGreen} strokeWidth={2} />
      <Rect x="36" y="52" width="68" height="30" rx="6" fill={brandColors.green} opacity={0.7} />
    </Svg>
  )
}

const DIAGRAMS: Record<InspectionShotKey, () => React.JSX.Element> = {
  front: FrontBackDiagram,
  rear: FrontBackDiagram,
  passenger_side: SideDiagram,
  driver_side: SideDiagram,
  front_corner: CornerDiagram,
  driver_corner: CornerDiagram,
  front_seats: InteriorDiagram,
  dashboard: DashboardDiagram,
  boot: BootDiagram,
}

export function InspectionShotGuide({ shotKey, compact }: { shotKey: InspectionShotKey; compact?: boolean }) {
  const Diagram = DIAGRAMS[shotKey]
  return (
    <View style={styles.container}>
      <View style={styles.diagramCard}>
        <Diagram />
      </View>
      {!compact && (
        <Text variant="bodySmall" style={styles.instruction}>
          {INSTRUCTIONS[shotKey]}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  diagramCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 16,
    padding: 12,
  },
  instruction: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
})
