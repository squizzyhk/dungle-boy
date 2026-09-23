import { describe, expect, it } from 'vitest'
import { coin, jumpBoost } from '../data/items'
import { PowerupController } from './PowerupController'

describe('PowerupController', () => {
  it('adds coin score using the current score multiplier', () => {
    const powerups = new PowerupController()
    let gained = 0
    powerups.collect(coin, (amount) => {
      gained = amount
    })
    expect(gained).toBe(10)

    powerups.collect(
      {
        id: 'score-boost',
        label: 'Score boost',
        kind: 'timed',
        durationMs: 1000,
        scoreMultiplier: 2,
      },
      () => {},
    )
    powerups.collect(coin, (amount) => {
      gained = amount
    })
    expect(gained).toBe(20)
  })

  it('raises jump height while a boost is active and restores it after', () => {
    const powerups = new PowerupController()
    let expired = 0
    powerups.collect(
      { ...jumpBoost, onExpire: () => { expired += 1 } },
      () => {},
    )

    expect(powerups.modifiers.jumpMultiplier).toBeCloseTo(1.35)
    expect(powerups.activeEffects[0]?.remainingMs).toBe(5000)

    powerups.update(4999)
    expect(expired).toBe(0)
    expect(powerups.modifiers.jumpMultiplier).toBeCloseTo(1.35)

    powerups.update(1)
    expect(expired).toBe(1)
    expect(powerups.modifiers.jumpMultiplier).toBe(1)
    expect(powerups.activeEffects).toHaveLength(0)
  })

  it('stacks timed multipliers and unwinds them together', () => {
    const powerups = new PowerupController()
    powerups.collect(jumpBoost, () => {})
    powerups.collect(jumpBoost, () => {})
    expect(powerups.modifiers.jumpMultiplier).toBeCloseTo(1.35 * 1.35)

    powerups.update(5000)
    expect(powerups.modifiers.jumpMultiplier).toBe(1)
  })

  it('lets a shield cancel one hit and then expires', () => {
    const powerups = new PowerupController()
    powerups.collect(
      {
        id: 'shield',
        label: 'Shield',
        kind: 'timed',
        durationMs: 2000,
        shield: 1,
      },
      () => {},
    )

    expect(powerups.modifiers.shield).toBe(1)
    expect(powerups.tryAbsorbHit()).toBe(true)
    expect(powerups.modifiers.shield).toBe(0)
    expect(powerups.tryAbsorbHit()).toBe(false)

    const refreshed = new PowerupController()
    refreshed.collect(
      {
        id: 'shield',
        label: 'Shield',
        kind: 'timed',
        durationMs: 2000,
        shield: 1,
      },
      () => {},
    )
    refreshed.update(2000)
    expect(refreshed.modifiers.shield).toBe(0)
    expect(refreshed.tryAbsorbHit()).toBe(false)
  })

  it('runs instant collect hooks', () => {
    const powerups = new PowerupController()
    let collected = 0
    powerups.collect({ ...coin, onCollect: () => { collected += 1 } }, () => {})
    expect(collected).toBe(1)
    expect(powerups.modifiers.speedMultiplier).toBe(1)
  })
})
