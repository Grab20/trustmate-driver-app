import { View, StyleSheet } from 'react-native'
import Svg, { Rect, Circle, Path, Ellipse, Line, G } from 'react-native-svg'
import { Text } from 'react-native-paper'
import { brandColors } from '../theme/theme'

export type InspectionShotKey =
  | 'front'
  | 'front_driver_side'
  | 'back_driver_side'
  | 'front_passenger_side'
  | 'back_passenger_side'
  | 'rear'
  | 'boot'
  | 'dashboard'
  | 'passenger_dashboard'
  | 'back_seats'
  | 'front_seats'

// Walkaround order: front, then each corner in turn, ending at the back and
// the boot. The two full-side shots were dropped — each corner shot already
// shows most of both flanks, so they were redundant with this corner set.
export const EXTERIOR_SHOT_KEYS: InspectionShotKey[] = [
  'front',
  'front_driver_side',
  'back_driver_side',
  'front_passenger_side',
  'back_passenger_side',
  'rear',
  'boot',
]

export const INTERIOR_SHOT_KEYS: InspectionShotKey[] = ['dashboard', 'passenger_dashboard', 'back_seats', 'front_seats']

export const SHOT_LABELS: Record<InspectionShotKey, string> = {
  front: 'Front',
  front_driver_side: 'Front Driver Side',
  back_driver_side: 'Back Driver Side',
  front_passenger_side: 'Front Passenger Side',
  back_passenger_side: 'Back Passenger Side',
  rear: 'Back',
  boot: 'Boot / Trunk',
  dashboard: 'Dashboard',
  passenger_dashboard: 'Passenger Dashboard',
  back_seats: 'Back Seats',
  front_seats: 'Front Seats',
}

export const INSTRUCTIONS: Record<InspectionShotKey, string> = {
  front: 'Stand back about 2m directly in front of the car, and include the full bumper, number plate, and windscreen.',
  front_driver_side: "Stand at the front corner on the driver's side, angled so both the front and driver side are visible.",
  back_driver_side: "Stand at the back corner on the driver's side, angled so both the back and driver side are visible.",
  front_passenger_side: "Stand at the front corner on the passenger's side, angled so both the front and passenger side are visible.",
  back_passenger_side: "Stand at the back corner on the passenger's side, angled so both the back and passenger side are visible.",
  rear: 'Stand back about 2m directly behind the car, and include the full bumper and number plate.',
  boot: 'Open the boot/trunk and photograph the inside, empty and clearly lit.',
  dashboard: 'Sit in the driver seat and photograph the dashboard, steering wheel, and odometer.',
  passenger_dashboard: 'Sit in the passenger seat and photograph the dashboard and glovebox area from that side.',
  back_seats: 'Open a back door and photograph the back seats and floor area.',
  front_seats: 'Open the driver door and photograph the front seats and floor area.',
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

// A corner view shows one full side plus one end of the car. `mirror` flips it
// left/right (driver vs passenger side); `flip` mirrors it front-to-back so the
// "nose" (narrower, windscreen-raked end) points the other way (front vs back
// corner) — the two flags together cover all four corners from one shape.
function CornerDiagram({ mirror = false, flip = false }: { mirror?: boolean; flip?: boolean }) {
  const scaleX = mirror ? -1 : 1
  const scaleY = flip ? -1 : 1
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Ellipse cx="72" cy="92" rx="55" ry="7" fill="#00000012" />
      <G transform={`translate(72,60) scale(${scaleX},${scaleY}) translate(-72,-60)`}>
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
      </G>
    </Svg>
  )
}

function FrontDriverSideDiagram() {
  return <CornerDiagram mirror={false} flip={false} />
}
function BackDriverSideDiagram() {
  return <CornerDiagram mirror={false} flip={true} />
}
function BackPassengerSideDiagram() {
  return <CornerDiagram mirror={true} flip={true} />
}
function FrontPassengerSideDiagram() {
  return <CornerDiagram mirror={true} flip={false} />
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

function BackSeatsDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Rect x="18" y="16" width="104" height="78" rx="12" fill="#F4F7F5" stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Rect x="26" y="46" width="88" height="36" rx="8" fill={brandColors.green} opacity={0.85} />
      <Line x1="70" y1="46" x2="70" y2="82" stroke="#F4F7F5" strokeWidth={3} />
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

// Mirror of the dashboard shot, taken from the passenger seat: the glovebox
// (a distinct panel on the passenger side) replaces the steering wheel as the
// focal point, since that's what this angle is meant to catch.
function PassengerDashboardDiagram() {
  return (
    <Svg width={140} height={110} viewBox="0 0 140 110">
      <Rect x="18" y="55" width="104" height="30" rx="10" fill={brandColors.darkGreen} />
      <Rect x="22" y="60" width="42" height="20" rx="4" fill={brandColors.mintGreen} />
      <Rect x="88" y="58" width="24" height="24" rx="3" fill="#fff" stroke={brandColors.darkGreen} strokeWidth={2.5} />
      <Line x1="88" y1="70" x2="112" y2="70" stroke={brandColors.darkGreen} strokeWidth={1.5} opacity={0.5} />
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
  front_driver_side: FrontDriverSideDiagram,
  back_driver_side: BackDriverSideDiagram,
  back_passenger_side: BackPassengerSideDiagram,
  front_passenger_side: FrontPassengerSideDiagram,
  front_seats: InteriorDiagram,
  back_seats: BackSeatsDiagram,
  dashboard: DashboardDiagram,
  passenger_dashboard: PassengerDashboardDiagram,
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
