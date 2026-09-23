import { describe, expect, it } from 'vitest'
import { runSpeed } from './speed'

const curve = { startSpeed: 200, accelPerSecond: 20, maxSpeed: 300 }

describe('runSpeed', () => {
  it('starts at the level speed', () => {
    expect(runSpeed(0, curve, 1)).toBe(200)
  })

  it('accelerates over time and then caps', () => {
    expect(runSpeed(2, curve, 1)).toBe(240)
    expect(runSpeed(20, curve, 1)).toBe(300)
  })

  it('applies a powerup multiplier after the cap', () => {
    expect(runSpeed(20, curve, 1.5)).toBe(450)
    expect(runSpeed(0, curve, 1.25)).toBe(250)
  })
})
