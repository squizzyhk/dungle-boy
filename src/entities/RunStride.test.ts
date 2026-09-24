import { describe, expect, it } from 'vitest'
import { legAt, RUN_STANCE, strideAt } from './RunStride'

describe('short marshmallow steps', () => {
  it('alternates which leg reaches forward every half-cycle', () => {
    for (const phase of [0, .12, .25, .38]) {
      const a = strideAt(phase), b = strideAt(phase + .5)
      expect(a.near.x).toBeCloseTo(b.far.x, 8)
      expect(a.far.x).toBeCloseTo(b.near.x, 8)
      expect(a.near.y).toBeCloseTo(b.far.y, 8)
    }
    expect(strideAt(0).near.x).toBeGreaterThan(strideAt(0).far.x)
    expect(strideAt(.5).near.x).toBeLessThan(strideAt(.5).far.x)
  })
  it('keeps each planted round end level while it pushes backward', () => {
    const contact = legAt(0), push = legAt(.2), toeOff = legAt(RUN_STANCE)
    expect(contact.planted).toBe(true)
    expect(push.planted).toBe(true)
    expect(contact.y).toBe(push.y)
    expect(contact.x).toBeGreaterThan(push.x)
    expect(push.x).toBeGreaterThan(toeOff.x)
  })
  it('keeps recovery under the belly instead of circling up beside it', () => {
    for (let i = 0; i < 240; i++) {
      const pose = strideAt(i / 240)
      for (const leg of [pose.near, pose.far]) {
        expect(Math.abs(leg.x)).toBeLessThanOrEqual(14)
        expect(leg.y).toBeGreaterThanOrEqual(159.5)
        expect(leg.y).toBeLessThanOrEqual(165.5)
      }
      expect(Math.abs(pose.bob)).toBeLessThanOrEqual(2.2)
      expect(Math.abs(pose.armAngle)).toBeLessThanOrEqual(.22)
    }
  })
  it('joins cleanly at release and the looping boundary', () => {
    for (const boundary of [RUN_STANCE, 1]) {
      const before=legAt(boundary-1e-6), after=legAt(boundary+1e-6)
      expect(Math.abs(before.x-after.x)).toBeLessThan(.001)
      expect(Math.abs(before.y-after.y)).toBeLessThan(.001)
    }
  })
})
