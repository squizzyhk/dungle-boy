export type SpeedCurve = {
  startSpeed: number
  accelPerSecond: number
  maxSpeed: number
}

export function runSpeed(elapsedSec: number, curve: SpeedCurve, speedMultiplier: number): number {
  const base = Math.min(
    curve.maxSpeed,
    curve.startSpeed + curve.accelPerSecond * elapsedSec,
  )
  return base * speedMultiplier
}
