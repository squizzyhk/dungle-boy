import { RUN_FRAME_COUNT } from './RunStride'

export type MallowPose = {
  texture: 'mallow' | 'mallow-run'
  frame: number
  scaleX: number
  scaleY: number
  angle: number
  lift: number
}

export type MallowMotionInput = {
  grounded: boolean
  velocityY: number
  speed: number
}

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value))

/** The soft body is visual only; the Arcade body remains a stable rectangle. */
export class MallowMotion {
  private stretch = 0
  private stretchVelocity = 0
  private runPhase = 0
  private landingMs = 0
  private launchMs = 0
  private lean = 0

  jump(double: boolean): void {
    this.landingMs = 0
    this.launchMs = double ? 145 : 110
    this.stretch = double ? -0.06 : 0.08
    this.stretchVelocity = double ? 6.8 : 5.2
  }

  land(fallSpeed: number): void {
    const impact = clamp(fallSpeed / 780, 0, 1)
    this.launchMs = 0
    this.landingMs = 85 + impact * 60
    this.stretch = -(0.09 + impact * 0.2)
    this.stretchVelocity = -(0.3 + impact * 1.1)
  }

  update(dtMs: number, input: MallowMotionInput): MallowPose {
    // Small integration steps keep the same soft recoil at 30, 60, and 120 Hz.
    const elapsed = clamp(dtMs / 1000, 0, 0.05)
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)))
    const dt = elapsed / steps
    const moving = Math.abs(input.speed) > 5
    const cyclesPerSecond = clamp(Math.abs(input.speed) / 180, 1.2, 2.4)

    for (let step = 0; step < steps; step += 1) {
      this.landingMs = Math.max(0, this.landingMs - dt * 1000)
      this.launchMs = Math.max(0, this.launchMs - dt * 1000)
      if (input.grounded && moving) {
        this.runPhase = (this.runPhase + cyclesPerSecond * dt) % 1
      }
      const stride = Math.sin(this.runPhase * Math.PI * 4)
      const target = input.grounded
        ? moving ? stride * 0.008 : 0
        : clamp(input.velocityY / 2200, -0.018, 0.08)
      const acceleration = (target - this.stretch) * 340 - this.stretchVelocity * 14
      this.stretchVelocity += acceleration * dt
      this.stretch = clamp(this.stretch + this.stretchVelocity * dt, -0.38, 0.36)

      const leanTarget = input.grounded
        ? moving ? 1.2 + stride * 0.6 : 0
        : clamp(input.velocityY / 95, -4, 6)
      this.lean += (leanTarget - this.lean) * (1 - Math.exp(-12 * dt))
    }

    let frame: number
    if (input.grounded) {
      frame = this.landingMs > 0 ? 8 : moving ? Math.floor(this.runPhase * RUN_FRAME_COUNT) : 0
    } else if (this.launchMs > 0 || input.velocityY < -115) {
      frame = 9
    } else if (input.velocityY < 115) {
      frame = 10
    } else {
      frame = 11
    }

    // Opposite log scales preserve the silhouette's area through every wobble.
    const scaleY = Math.exp(this.stretch)
    return {
      texture: input.grounded && this.landingMs <= 0 ? 'mallow-run' : 'mallow',
      frame,
      scaleX: 1 / scaleY,
      scaleY,
      angle: this.lean,
      lift: 0,
    }
  }
}
