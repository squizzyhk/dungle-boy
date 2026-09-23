import { describe, expect, it } from 'vitest'
import { JUMP } from '../entities/JumpController'
import { GRAVITY, GROUND_Y } from '../constants'
import { getLevel, levels, nextLevel } from './levels'
import type { LevelConfig } from '../types'

function hopHeight(velocity: number): number {
  return (velocity * velocity) / (2 * GRAVITY)
}

const singleHop = hopHeight(Math.abs(JUMP.firstVelocity))
const doubleHop = singleHop + hopHeight(Math.abs(JUMP.doubleVelocity))

describe('levels', () => {
  it('moves from one level to the next, then back to the menu', () => {
    expect(levels).toHaveLength(3)
    expect(nextLevel(0, levels.length)).toBe(1)
    expect(nextLevel(2, levels.length)).toBe('menu')
    expect(getLevel(1).name).toBe(levels[1].name)
  })

  it('keeps every platform inside a double jump and requires one', () => {
    const startSpeeds = levels.map((level) => level.startSpeed)
    expect([...startSpeeds].sort((a, b) => a - b)).toEqual(startSpeeds)
    expect(new Set(startSpeeds).size).toBe(startSpeeds.length)

    for (const level of levels) {
      expect(level.maxSpeed).toBeGreaterThanOrEqual(level.startSpeed)
      expect(level.segments.some((segment) => segment.type === 'finish')).toBe(true)
      expect(level.segments.some((segment) => segment.type === 'ground' && segment.x === 0)).toBe(true)
      expect(level.segments.some((segment) => segment.type === 'pickup' && segment.itemId === 'coin')).toBe(true)
      expect(level.segments.some((segment) => segment.type === 'pickup' && segment.itemId === 'jump-boost')).toBe(true)
      expect(level.segments.some((segment) => segment.type === 'obstacle')).toBe(true)

      const rises = level.segments.flatMap((segment) =>
        segment.type === 'platform' ? [GROUND_Y - segment.y] : [],
      )
      expect(rises.some((rise) => rise > singleHop + 8)).toBe(true)
      for (const rise of rises) {
        expect(rise).toBeLessThan(doubleHop - 8)
      }
    }
  })

  it('places high platforms where a double jump can land and a walk-off can exit', () => {
    for (const level of levels) {
      const grounds = level.segments.filter((segment) => segment.type === 'ground')
      const platforms = level.segments.filter((segment) => segment.type === 'platform')

      for (const platform of platforms) {
        const rise = GROUND_Y - platform.y
        if (rise <= singleHop + 8) continue

        const lip = Math.max(
          ...grounds
            .map((ground) => ground.x + ground.width)
            .filter((right) => right <= platform.x),
        )
        expect(Number.isFinite(lip)).toBe(true)

        const speed = speedAt(lip, level)
        const airtime = (platform.x - lip) / speed
        expect(heightAt(airtime, 0.35)).toBeGreaterThan(rise + 10)

        const platformRight = platform.x + platform.width
        const landing = grounds
          .filter((ground) => ground.x >= platformRight - 1)
          .sort((a, b) => a.x - b.x)[0]
        expect(landing).toBeDefined()
        const gap = landing.x - platformRight
        const fallTime = Math.sqrt((2 * rise) / GRAVITY)
        const travel = speedAt(platformRight, level) * fallTime
        expect(gap).toBeGreaterThan(0)
        expect(gap).toBeLessThan(travel * 0.8)
      }
    }
  })
})

function speedAt(distance: number, level: LevelConfig): number {
  let x = 0
  let t = 0
  while (x < distance && t < 600) {
    const speed = Math.min(level.maxSpeed, level.startSpeed + level.accelPerSecond * t)
    x += speed * 0.01
    t += 0.01
  }
  return Math.min(level.maxSpeed, level.startSpeed + level.accelPerSecond * t)
}

function heightAt(atSec: number, doubleAt: number | null): number {
  let y = 0
  let vy = -JUMP.firstVelocity
  let doubled = false
  const dt = 1 / 200
  const steps = Math.max(1, Math.ceil(atSec / dt))
  for (let step = 0; step < steps; step += 1) {
    const t = step * dt
    if (doubleAt !== null && !doubled && t >= doubleAt) {
      vy = -JUMP.doubleVelocity
      doubled = true
    }
    vy -= GRAVITY * dt
    y += vy * dt
  }
  return y
}
