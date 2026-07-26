import type { InspectionShotKey } from '../components/InspectionShotGuide'

export type DamageBoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

// Used by the pre-rental reference-photo damage scan (analyze-reference-photo),
// which has no baseline to compare against so it only ever reports damage it
// finds, not a verified/unable-to-verify breakdown. Kept separate from the
// weekly-inspection component findings below.
export type DamageItem = {
  shot: InspectionShotKey
  location: string
  type: string
  confidencePercent: number
  estimatedSizeCm: number | null
  description: string
  boundingBox: DamageBoundingBox | null
}

export type ComponentFindingStatus = 'verified' | 'unable_to_verify' | 'new_finding'

// One named vehicle component (e.g. "Front Bumper", "Driver Seat") assessed
// within a single shot — the unit the whole report is built from, so every
// line the owner reads names a specific part and states exactly what was
// checked, instead of a single pass/fail verdict for the whole photo.
export type ComponentFinding = {
  shot: InspectionShotKey
  component: string
  status: ComponentFindingStatus
  findingType: string | null
  confidencePercent: number
  description: string
  boundingBox: DamageBoundingBox | null
}

export type ShotResult = {
  shot: InspectionShotKey
  hasBaseline: boolean
  overallMatchPercent: number | null
  components: ComponentFinding[]
}

export type VehicleVerification = {
  plateMatch: boolean | null
  colorMatch: boolean | null
  modelMatch: boolean | null
  interiorMatch: boolean | null
  dashboardMatch: boolean | null
  detectedPlateNumber: string | null
  note: string
}

export type InspectionQuality = {
  sharpness: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  lighting: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  coverage: 'Complete' | 'Incomplete'
  angles: 'Correct' | 'Incorrect'
  percent: number
  starRating: number
}

export type SummaryBullet = {
  text: string
  ok: boolean
}

export type VehicleHealthReport = {
  comparedAgainst: 'previous_inspection' | 'reference_photos' | 'none'
  shots: ShotResult[]
  newFindings: ComponentFinding[]
  unableToVerify: ComponentFinding[]
  areasInspected: number
  areasVerified: number
  verification: VehicleVerification
  quality: InspectionQuality
  summary: SummaryBullet[]
  healthScore: number
  healthLabel: string
  recommendation: string
}

export type InspectionAnalysis = VehicleHealthReport | { error: string; raw?: string }

export function isVehicleHealthReport(analysis: unknown): analysis is VehicleHealthReport {
  return (
    !!analysis &&
    typeof analysis === 'object' &&
    'healthScore' in (analysis as Record<string, unknown>) &&
    Array.isArray((analysis as Record<string, unknown>).shots)
  )
}
