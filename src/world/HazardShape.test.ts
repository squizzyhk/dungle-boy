import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { damageMask, insideDamageShape, maskTouchesPlayer } from './HazardShape'

describe('hazard contact follows the artwork', () => {
  it('does not treat the empty corner of an original spike as a hit', () => {
    expect(insideDamageShape('spike', 0, .01, .05)).toBe(false)
    expect(insideDamageShape('spike', 0, 1 / 6, .2)).toBe(true)
    expect(insideDamageShape('spike', 0, .5, .99)).toBe(false)
  })

  it('fully retracts, ignores the socket, and follows the spike height in each frame', async () => {
    const frames: Uint8Array[] = []
    for (let frame = 0; frame < 8; frame++) {
      const rgba = await sharp('public/assets/level-kit/obstacles/retracting-spikes.png')
        .extract({ left: frame % 4 * 256, top: Math.floor(frame / 4) * 256, width: 256, height: 256 }).ensureAlpha().raw().toBuffer()
      const mask = damageMask(rgba, 256, 256, 'retracting-spikes', frame)
      frames.push(mask)
      expect(mask.slice(190 * 256).some(Boolean)).toBe(false)
      // Every damaging pixel must also be a solid painted pixel.
      expect(mask.every((v, i) => !v || rgba[i * 4 + 3] >= 220)).toBe(true)
    }
    expect(frames[0].some(Boolean)).toBe(false)
    const bounds = { x: 100, y: 100, width: 256, height: 256 }
    const onTallTip = { x: 216, y: 148, width: 24, height: 24 }
    expect(maskTouchesPlayer(frames[3], 256, 256, bounds, onTallTip)).toBe(true)
    expect(maskTouchesPlayer(frames[1], 256, 256, bounds, onTallTip)).toBe(false)
    expect(maskTouchesPlayer(frames[3], 256, 256, bounds, { x: 100, y: 100, width: 32, height: 44 })).toBe(false)
  })

  it('ignores transparent rotor corners and hits an opaque blade at every animation frame', async () => {
    for (let frame = 0; frame < 8; frame++) {
      const rgba = await sharp('public/assets/level-kit/obstacles/plasma-rotor.png')
        .extract({ left: frame % 4 * 256, top: Math.floor(frame / 4) * 256, width: 256, height: 256 }).ensureAlpha().raw().toBuffer()
      const mask = damageMask(rgba, 256, 256, 'plasma-rotor', frame)
      const bounds = { x: 0, y: 0, width: 128, height: 128 }
      expect(maskTouchesPlayer(mask, 256, 256, bounds, { x: 0, y: 0, width: 8, height: 8 })).toBe(false)
      const pixel = mask.findIndex((v, i) => v === 1 && Math.hypot(i % 256 - 128, Math.floor(i / 256) - 128) > 70)
      expect(pixel).toBeGreaterThan(0)
      expect(maskTouchesPlayer(mask, 256, 256, bounds, { x: (pixel % 256) / 2 - 2, y: Math.floor(pixel / 256) / 2 - 2, width: 6, height: 6 })).toBe(true)
    }
  })

  it('never lets a translucent glow cause damage', () => {
    const rgba = new Uint8Array(4 * 4 * 4).fill(200)
    expect(damageMask(rgba, 4, 4, 'plasma-rotor', 0).some(Boolean)).toBe(false)
  })
})
