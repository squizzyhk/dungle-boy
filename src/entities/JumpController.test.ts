import { describe, expect, it } from 'vitest'
import { JUMP, JumpController } from './JumpController'

const ground = {
  dtMs: 16,
  grounded: true,
  jumpPressed: false,
  jumpReleased: false,
  velocityY: 0,
}

describe('JumpController', () => {
  it('spends the ground jump and leaves the air jump', () => {
    const jumps = new JumpController()
    const result = jumps.step({ ...ground, jumpPressed: true })

    expect(result.event).toBe('first')
    expect(result.velocityY).toBe(JUMP.firstVelocity)
    expect(jumps.jumpsRemaining).toBe(1)
  })

  it('cuts the first jump short when the button is released while rising', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })

    const result = jumps.step({
      ...ground,
      grounded: false,
      jumpReleased: true,
      velocityY: JUMP.firstVelocity,
    })

    expect(result.velocityY).toBeCloseTo(JUMP.firstVelocity * JUMP.cutMultiplier)
  })

  it('does not cut a jump that is already falling', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })

    const result = jumps.step({
      ...ground,
      grounded: false,
      jumpReleased: true,
      velocityY: 40,
    })

    expect(result.velocityY).toBeUndefined()
    expect(result.event).toBe('none')
  })

  it('uses a committed second hop and ignores release', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })
    jumps.step({ ...ground, grounded: false, velocityY: -200 })

    const doubled = jumps.step({
      ...ground,
      grounded: false,
      jumpPressed: true,
      velocityY: -80,
    })
    const released = jumps.step({
      ...ground,
      grounded: false,
      jumpReleased: true,
      velocityY: JUMP.doubleVelocity,
    })

    expect(doubled.event).toBe('double')
    expect(doubled.velocityY).toBe(JUMP.doubleVelocity)
    expect(jumps.jumpsRemaining).toBe(0)
    expect(released.velocityY).toBeUndefined()
  })

  it('refuses a third jump until the body is on a surface again', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })
    jumps.step({ ...ground, grounded: false, velocityY: -200 })
    jumps.step({ ...ground, grounded: false, jumpPressed: true, velocityY: -80 })

    const third = jumps.step({
      ...ground,
      grounded: false,
      jumpPressed: true,
      velocityY: -80,
    })
    expect(third.event).toBe('none')
    expect(jumps.jumpsRemaining).toBe(0)

    jumps.step({
      ...ground,
      grounded: false,
      dtMs: JUMP.bufferMs + 10,
      velocityY: 200,
    })
    const landed = jumps.step(ground)
    expect(landed.event).toBe('none')
    expect(jumps.jumpsRemaining).toBe(2)
  })

  it('still allows the ground jump just after walking off a ledge', () => {
    const jumps = new JumpController()
    jumps.step(ground)
    jumps.step({ ...ground, grounded: false, dtMs: 100, velocityY: 120 })

    const result = jumps.step({
      ...ground,
      grounded: false,
      jumpPressed: true,
      velocityY: 180,
    })

    expect(result.event).toBe('first')
    expect(jumps.jumpsRemaining).toBe(1)
  })

  it('turns a late coyote press into the air jump only', () => {
    const jumps = new JumpController()
    jumps.step(ground)
    jumps.step({ ...ground, grounded: false, dtMs: JUMP.coyoteMs, velocityY: 80 })

    const result = jumps.step({
      ...ground,
      grounded: false,
      jumpPressed: true,
      velocityY: 160,
    })

    expect(result.event).toBe('double')
    expect(jumps.jumpsRemaining).toBe(0)
  })

  it('buffers an early press into a jump on landing', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })
    jumps.step({ ...ground, grounded: false, velocityY: -200 })
    jumps.step({ ...ground, grounded: false, jumpPressed: true, velocityY: -40 })
    jumps.step({ ...ground, grounded: false, jumpPressed: true, velocityY: 20 })
    jumps.step({ ...ground, grounded: false, dtMs: 50, velocityY: 200 })

    const landing = jumps.step(ground)

    expect(landing.event).toBe('first')
    expect(landing.velocityY).toBe(JUMP.firstVelocity)
  })

  it('drops the buffer when the press was too early', () => {
    const jumps = new JumpController()
    jumps.step({ ...ground, jumpPressed: true })
    jumps.step({ ...ground, grounded: false, velocityY: -200 })
    jumps.step({ ...ground, grounded: false, jumpPressed: true, velocityY: -40 })
    jumps.step({ ...ground, grounded: false, jumpPressed: true, velocityY: 20 })
    jumps.step({
      ...ground,
      grounded: false,
      dtMs: JUMP.bufferMs + 10,
      velocityY: 200,
    })

    const landing = jumps.step(ground)

    expect(landing.event).toBe('none')
    expect(jumps.jumpsRemaining).toBe(2)
  })
})
