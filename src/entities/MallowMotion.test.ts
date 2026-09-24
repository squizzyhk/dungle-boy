import { describe, expect, it } from 'vitest'
import { RUN_FRAME_COUNT } from './RunStride'
import { MallowMotion } from './MallowMotion'

const idle = { grounded: true, velocityY: 0, speed: 0 }

describe('MallowMotion', () => {
  it('absorbs a hard landing more than a shallow hop and then rebounds', () => {
    const soft = new MallowMotion()
    const hard = new MallowMotion()
    soft.land(120)
    hard.land(720)
    const softImpact = soft.update(16, idle)
    const hardImpact = hard.update(16, idle)
    expect(hardImpact.scaleY).toBeLessThan(softImpact.scaleY)
    expect(hardImpact.scaleX).toBeGreaterThan(softImpact.scaleX)
    expect(hardImpact.frame).toBe(8)

    let rebounded = false
    for (let i = 0; i < 90; i += 1) {
      if (hard.update(1000 / 60, idle).scaleY > 1.02) rebounded = true
    }
    expect(rebounded).toBe(true)
    expect(hard.update(16, idle).scaleY).toBeCloseTo(1, 3)
  })

  it('keeps volume constant throughout jump, second jump, and landing', () => {
    const motion = new MallowMotion()
    motion.jump(false)
    for (let i = 0; i < 120; i += 1) {
      if (i === 30) motion.jump(true)
      if (i === 65) motion.land(690)
      const pose = motion.update(1000 / 60, {
        grounded: i >= 65,
        speed: 300,
        velocityY: i < 65 ? -500 + i * 20 : 0,
      })
      expect(pose.scaleX * pose.scaleY).toBeCloseTo(1, 12)
      expect(pose.scaleY).toBeGreaterThan(0.68)
      expect(pose.scaleY).toBeLessThan(1.44)
    }
  })

  it('uses distinct stretch, tucked apex, fall, and landing poses', () => {
    const motion = new MallowMotion()
    motion.jump(false)
    expect(motion.update(16, { ...idle, grounded: false, velocityY: -500 }).frame).toBe(9)
    for (let i = 0; i < 10; i += 1) motion.update(16, { ...idle, grounded: false, velocityY: -300 })
    expect(motion.update(16, { ...idle, grounded: false, velocityY: 0 }).frame).toBe(10)
    expect(motion.update(16, { ...idle, grounded: false, velocityY: 200 }).frame).toBe(11)
    motion.land(420)
    expect(motion.update(16, idle).frame).toBe(8)
  })

  it('has consistent recoil at different rendering rates and after a stalled frame', () => {
    const simulate = (fps: number): number => {
      const motion = new MallowMotion()
      motion.land(700)
      let height = 1
      for (let frame = 0; frame < fps / 2; frame += 1) {
        height = motion.update(1000 / fps, idle).scaleY
      }
      return height
    }
    expect(simulate(30)).toBeCloseTo(simulate(120), 5)

    const motion = new MallowMotion()
    motion.jump(true)
    const afterStall = motion.update(10_000, { ...idle, grounded: false, velocityY: -500 })
    expect(Number.isFinite(afterStall.scaleY)).toBe(true)
    expect(afterStall.scaleY).toBeLessThan(1.44)
  })

  it('visits every running pose and advances the stride faster at higher speed', () => {
    const slow = new MallowMotion()
    const fast = new MallowMotion()
    const frames = new Set<number>()
    let slowChanges = 0
    let fastChanges = 0
    let slowFrame = 0
    let fastFrame = 0
    for (let i = 0; i < 120; i += 1) {
      const slowPose = slow.update(1000 / 120, { ...idle, speed: 200 })
      const fastPose = fast.update(1000 / 120, { ...idle, speed: 400 })
      frames.add(slowPose.frame)
      if (slowPose.frame !== slowFrame) slowChanges += 1
      if (fastPose.frame !== fastFrame) fastChanges += 1
      slowFrame = slowPose.frame
      fastFrame = fastPose.frame
    }
    expect([...frames].sort((a,b)=>a-b)).toEqual(Array.from({length:RUN_FRAME_COUNT},(_,i)=>i))
    expect(fastChanges).toBeGreaterThan(slowChanges * 1.7)
  })
})
