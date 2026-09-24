import { beforeAll, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { damageMask, maskTouchesPlayer } from '../world/HazardShape'
import {
  GRAVITY,
  GROUND_Y,
  KILL_Y,
  PLAYER_HEIGHT,
  PLAYER_START_X,
  PLAYER_WIDTH,
} from '../constants'
import { JUMP } from '../entities/JumpController'
import { runSpeed } from '../run/speed'
import { getLevel, levels, nextLevel, worldWidth } from './levels'
import type { LevelConfig } from '../types'

const singleHop = JUMP.firstVelocity ** 2 / (2 * GRAVITY)
const doubleHop = singleHop + JUMP.doubleVelocity ** 2 / (2 * GRAVITY)

type PlannedJump = { x: number; doubleAt?: number }

// These are playable full-height jumps, not teleports or power-up assisted routes.
// The second press is at the first apex, so releasing the first press does not cut it.
const routes: PlannedJump[][] = [
  [
    { x: 768 }, { x: 1605 }, { x: 2110 }, { x: 2451 },
    { x: 3420, doubleAt: 0.35 }, { x: 4492 }, { x: 4861 },
  ],
  [
    { x: 780 }, { x: 1500 }, { x: 1905 }, { x: 2355 },
    { x: 3265, doubleAt: .35 }, { x: 3810 }, { x: 4380 },
    { x: 4810 }, { x: 5640 }, { x: 6110 },
  ],
  [
    { x: 740 }, { x: 1190 }, { x: 1580 }, { x: 2740 },
    { x: 3150 }, { x: 3550 }, { x: 4330 },
    { x: 4660, doubleAt: .35 }, { x: 5265 },
    { x: 5870 }, { x: 6290 }, { x: 7070 }, { x: 7530 }, { x: 8010 },
  ],
]

const upperRouteJumps = [[1130, 2780], [1110, 6430], [3880]]

// Read the actual shipped art. Union every animation frame for a worst-phase
// route test: a passing route never depends on luck with trap timing.
const masks = new Map<string, Uint8Array>()
beforeAll(async () => {
  for (const kind of ['reactor-crate', 'crystal-cluster', 'retracting-spikes', 'plasma-rotor'] as const) {
    const animated = kind === 'retracting-spikes' || kind === 'plasma-rotor'
    const union = new Uint8Array(256 * 256)
    for (let frame = 0; frame < (animated ? 8 : 1); frame++) {
      const rgba = await sharp(`public/assets/level-kit/obstacles/${kind}.png`).extract({ left: frame % 4 * 256, top: Math.floor(frame / 4) * 256, width: 256, height: 256 }).ensureAlpha().raw().toBuffer()
      const mask = damageMask(rgba, 256, 256, kind, frame)
      mask.forEach((v, i) => { union[i] ||= v })
    }
    masks.set(kind, union)
  }
})

describe('levels', () => {
  it('moves through three distinct courses, then back to the menu', () => {
    expect(levels.map((level) => level.name)).toEqual([
      'Orbital Garden', 'Crystal Aqueduct', 'Ember Foundry',
    ])
    expect(new Set(levels.map((level) => level.id)).size).toBe(3)
    expect(nextLevel(0, levels.length)).toBe(1)
    expect(nextLevel(2, levels.length)).toBe('menu')
    expect(getLevel(1)).toBe(levels[1])
    expect(() => getLevel(3)).toThrow('Level 3 not found')
  })

  it('builds a readable introduction, collectible upper routes, and a safe finish approach', () => {
    const startSpeeds = levels.map((level) => level.startSpeed)
    expect([...startSpeeds].sort((a, b) => a - b)).toEqual(startSpeeds)
    expect(new Set(startSpeeds).size).toBe(3)

    for (const level of levels) {
      expect(level.maxSpeed).toBeGreaterThanOrEqual(level.startSpeed)
      const grounds = level.segments.filter((segment) => segment.type === 'ground')
      const hazards = level.segments.filter((segment) => segment.type === 'obstacle')
      const finishes = level.segments.filter((segment) => segment.type === 'finish')
      const platforms = level.segments.filter((segment) => segment.type === 'platform')
      expect(finishes).toHaveLength(1)
      expect(grounds[0].x).toBe(0)
      expect(Math.min(...hazards.map((hazard) => hazard.x)) - PLAYER_START_X).toBeGreaterThan(600)
      expect(level.segments.filter((segment) => segment.type === 'pickup' && segment.itemId === 'coin').length).toBeGreaterThan(25)
      expect(level.segments.some((segment) => segment.type === 'pickup' && ['jump-boost', 'jump-orb'].includes(segment.itemId))).toBe(true)
      expect(platforms.some((platform) => GROUND_Y - platform.y < singleHop)).toBe(true)

      const finishX = finishes[0].x
      const finalGround = grounds.at(-1)!
      expect(finishX).toBeGreaterThan(finalGround.x + 300)
      expect(finalGround.x + finalGround.width).toBeGreaterThanOrEqual(finishX + 100)
      expect(finishX - Math.max(...hazards.map((hazard) => hazard.x + hazard.width))).toBeGreaterThanOrEqual(450)
      expect(worldWidth(level)).toBeGreaterThan(finishX + 500)

      for (const hazard of hazards) {
        expect([...grounds, ...platforms].some((floor) => hazard.x >= floor.x && hazard.x + hazard.width <= floor.x + floor.width)).toBe(true)
      }
    }
  })

  it('keeps elevated islands inside the unboosted double jump range', () => {
    for (const level of levels) {
      const highPlatforms = level.segments.filter(
        (segment) => segment.type === 'platform' && GROUND_Y - segment.y > singleHop + 8,
      )
      expect(highPlatforms.length).toBeGreaterThanOrEqual(1)
      for (const relay of highPlatforms) {
      if (relay.type !== 'platform') throw new Error('Expected relay platform')
      const preceding = level.segments.filter(s => (s.type === 'ground' || s.type === 'platform') && s.x < relay.x).at(-1)!
      if (preceding.type !== 'ground' && preceding.type !== 'platform') throw new Error('Expected preceding surface')
      expect(preceding.y - relay.y).toBeLessThan(doubleHop - 20)
      expect(level.segments.some((segment) =>
        segment.type === 'ground' && segment.x < relay.x + relay.width && segment.x + segment.width > relay.x,
      )).toBe(false)
      }
    }
  })

  for (const [index, level] of levels.entries()) {
    it(`can finish ${level.name} without collecting a boost, at 60 and 120 Hz`, () => {
      for (const hz of [60, 120]) {
        const result = simulateRoute(level, routes[index], 1 / hz)
        expect(result.failure, `${level.name} at ${hz} Hz: ${result.failure}`).toBeNull()
        expect(result.finished).toBe(true)
        expect(result.usedJumps).toBe(routes[index].length)
        expect(result.highRelayLandings).toBeGreaterThanOrEqual(1)
      }
    })

    it(`can use ${level.name}'s optional upper routes and safely return to the main deck`, () => {
      const upperRoute = [...routes[index], ...upperRouteJumps[index].map((x) => ({ x }))]
        .sort((a, b) => a.x - b.x)
      for (const hz of [60, 120]) {
        const result = simulateRoute(level, upperRoute, 1 / hz)
        expect(result.failure, `${level.name} upper route at ${hz} Hz: ${result.failure}`).toBeNull()
        expect(result.finished).toBe(true)
        expect(result.lowPlatformLandings).toBeGreaterThanOrEqual(upperRouteJumps[index].length)
      }
    })

    it(`requires the second jump to cross ${level.name}'s isolated relay`, () => {
      const withoutDouble = routes[index].map(({ x }) => ({ x }))
      const result = simulateRoute(level, withoutDouble, 1 / 120)
      expect(result.finished).toBe(false)
      expect(result.failure).toContain('fell')
      expect(result.highRelayLandings).toBe(0)
    })
  }
})

// A small independent ballistic playback of the authored inputs. It includes the
// real accelerating speed, full player rectangle, hazards, one-way platform tops,
// walk-offs, and kill plane. Pickups intentionally have no effect on the route.
function simulateRoute(level: LevelConfig, route: PlannedJump[], dt: number) {
  const surfaces = level.segments.filter((segment) => segment.type === 'ground' || segment.type === 'platform')
  const hazards = level.segments.filter((segment) => segment.type === 'obstacle')
  const finish = level.segments.find((segment) => segment.type === 'finish')!
  let x = PLAYER_START_X
  let feet = GROUND_Y
  let vy = 0
  let grounded = true
  let elapsed = 0
  let nextJump = 0
  let activeJump: PlannedJump | undefined
  let launchedAt = 0
  let doubled = false
  let highRelayLandings = 0
  let lowPlatformLandings = 0
  let failure: string | null = null
  let finished = false

  while (elapsed < 60) {
    if (nextJump < route.length && x >= route[nextJump].x) {
      if (!grounded) {
        failure = `jump ${nextJump + 1} has no landing runway at x=${x.toFixed(0)}`
        break
      }
      activeJump = route[nextJump++]
      launchedAt = elapsed
      doubled = false
      grounded = false
      vy = JUMP.firstVelocity
    }
    if (activeJump?.doubleAt !== undefined && !doubled && elapsed - launchedAt >= activeJump.doubleAt) {
      vy = JUMP.doubleVelocity
      doubled = true
    }

    const previousFeet = feet
    elapsed += dt
    x += runSpeed(elapsed, level, 1) * dt
    vy += GRAVITY * dt
    feet += vy * dt
    const wasGrounded = grounded
    grounded = false

    if (vy >= 0) {
      // Pick the uppermost crossed top when several surfaces overlap horizontally.
      const landing = surfaces
        .filter((surface) => x + PLAYER_WIDTH / 2 > surface.x && x - PLAYER_WIDTH / 2 < surface.x + surface.width)
        .filter((surface) => previousFeet <= surface.y + 0.01 && feet >= surface.y)
        .sort((a, b) => a.y - b.y)[0]
      if (landing) {
        feet = landing.y
        vy = 0
        grounded = true
        if (!wasGrounded && GROUND_Y - landing.y > singleHop + 8) highRelayLandings += 1
        if (!wasGrounded && landing.type === 'platform' && GROUND_Y - landing.y < singleHop) lowPlatformLandings += 1
        activeJump = undefined
      }
    }

    const collision = hazards.find((hazard) => {
      const mask = masks.get(hazard.kind)
      if (mask) return maskTouchesPlayer(mask, 256, 256, hazard, { x: x - PLAYER_WIDTH / 2, y: feet - PLAYER_HEIGHT, width: PLAYER_WIDTH, height: PLAYER_HEIGHT })
      return x + PLAYER_WIDTH / 2 > hazard.x && x - PLAYER_WIDTH / 2 < hazard.x + hazard.width &&
        feet > hazard.y && feet - PLAYER_HEIGHT < hazard.y + hazard.height
    })
    if (collision) {
      failure = `hit ${collision.kind} at x=${collision.x} with feet=${feet.toFixed(1)}`
      break
    }
    if (feet > KILL_Y) {
      failure = `fell at x=${x.toFixed(0)}`
      break
    }
    if (x >= finish.x) {
      finished = true
      break
    }
  }

  return { finished, failure, usedJumps: nextJump, highRelayLandings, lowPlatformLandings }
}
