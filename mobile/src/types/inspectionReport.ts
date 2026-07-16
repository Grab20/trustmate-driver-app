import type { InspectionShotKey } from '../components/InspectionShotGuide'

export type ShotComparisonStatus = 'ok' | 'warning' | 'no_baseline'

export type ShotComparison = {
  shot: InspectionShotKey
  status: ShotComparisonStatus
  note: string | null
}

export type DamageBoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export type DamageItem = {
  shot: InspectionShotKey
  location: string
  type: string
  confidencePercent: number
  estimatedSizeCm: number | null
  description: string
  boundingBox: DamageBoundingBox | null
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
  comparison: ShotComparison[]
  damage: DamageItem[]
  verification: VehicleVerification
  quality: InspectionQuality
  summary: SummaryBullet[]
  healthScore: number
  healthLabel: string
  recommendation: string
}

export type InspectionAnalysis = VehicleHealthReport | { error: string; raw?: string }

export function isVehicleHealthReport(analysis: unknown): analysis is VehicleHealthReport {
  return !!analysis && typeof analysis === 'object' && 'healthScore' in (analysis as Record<string, unknown>)
}
