// Single source of truth for TrustMate's trip-detection tuning. Nothing in
// src/lib/autoTripEngine.ts should hardcode a distance/speed/duration value —
// everything the state machine compares against lives here, so thresholds can
// be adjusted after testing with real drivers without touching the detection
// logic itself.
export const TRIP_DETECTION_CONFIG = {
  // --- Trip start ---
  // A trip is only confirmed once ALL three hold: the vehicle has been at or
  // above startSpeedKmh continuously, for at least startDurationSeconds, and
  // has covered at least startDistanceMeters since movement began. Requiring
  // all three (not just speed) is what filters out walking, a car being
  // shuffled around a parking area, GPS drift, and traffic creep that never
  // turns into a real trip.
  startSpeedKmh: 12,
  startDurationSeconds: 60,
  startDistanceMeters: 300,

  // --- Trip stop ---
  // A trip only ends once the vehicle has been below stopSpeedKmh AND within
  // stopMovementRadiusMeters of where it appeared to stop, continuously, for
  // stopDurationSeconds. Moving again before that window elapses resumes the
  // same trip instead of ending it — this is what keeps a red light, a
  // petrol stop, or a pickup from splitting one trip into several.
  stopSpeedKmh: 5,
  stopDurationSeconds: 300,
  // Deliberately a bit above maxUsableAccuracyMeters below — if it matched
  // exactly, ordinary GPS noise on a borderline-accurate fix could look like
  // "the vehicle moved" and keep resetting the stop timer while genuinely parked.
  stopMovementRadiusMeters: 60,

  // --- GPS fix quality gates ---
  // A fix worse than this is too imprecise to trust for distance/speed
  // accumulation (still fine for a coarse moving/stationary read).
  maxUsableAccuracyMeters: 50,
  // Faster than this on a public road is virtually certain to be a GPS
  // glitch (a jump to a distant point, or a corrupted Doppler reading).
  maxPlausibleSpeedKmh: 220,
  // A gap smaller than this between fixes is the signature of a post-Doze
  // background-backlog flush (a batch of buffered fixes delivered at once),
  // not real elapsed time — see autoTripEngine.ts for the full rationale.
  minSampleGapSeconds: 1,
  // Above this gap, don't integrate "average speed x elapsed time" between
  // two fixes — fall back to straight-line distance instead.
  maxSegmentIntegrationGapSeconds: 60,

  // --- Persistence cadence (battery / data-usage control) ---
  // A trip_waypoints row is only written once at least this much time OR
  // this much distance has passed since the last one — not on every raw GPS
  // fix, which would otherwise mean a database write every ~5 seconds for
  // the entire trip.
  waypointMinIntervalSeconds: 15,
  waypointMinDistanceMeters: 100,
  // The in-progress trip row (running distance/duration/speed) is only
  // pushed to the server this often while a trip is active, so an owner
  // watching a live trip still sees it update, just not on every single fix.
  progressUpdateMinIntervalSeconds: 20,
} as const

export type TripDetectionConfig = typeof TRIP_DETECTION_CONFIG
