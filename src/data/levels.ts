import {
  CRATE_HEIGHT,
  CRATE_WIDTH,
  GROUND_HEIGHT,
  GROUND_Y,
  PICKUP_SIZE,
  PLATFORM_HEIGHT,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
} from '../constants'
import type { LevelConfig, Segment } from '../types'

function ground(x: number, width: number): Segment {
  return { type: 'ground', x, y: GROUND_Y, width, height: GROUND_HEIGHT }
}

function platform(x: number, width: number, rise: number): Segment {
  return {
    type: 'platform',
    x,
    y: GROUND_Y - rise,
    width,
    height: PLATFORM_HEIGHT,
  }
}

function crate(x: number): Segment {
  return {
    type: 'obstacle',
    kind: 'crate',
    x,
    y: GROUND_Y - CRATE_HEIGHT,
    width: CRATE_WIDTH,
    height: CRATE_HEIGHT,
  }
}

function spike(x: number): Segment {
  return {
    type: 'obstacle',
    kind: 'spike',
    x,
    y: GROUND_Y - SPIKE_HEIGHT,
    width: SPIKE_WIDTH,
    height: SPIKE_HEIGHT,
  }
}

function pickup(x: number, itemId: string, y = GROUND_Y - 52): Segment {
  return { type: 'pickup', x, y, itemId }
}

function gap(x: number, width: number): Segment {
  return { type: 'gap', x, width }
}

const HIGH_RISE = 124

export const levels: LevelConfig[] = [
  {
    id: 'warm-up',
    name: 'Warm-up',
    startSpeed: 210,
    accelPerSecond: 5,
    maxSpeed: 260,
    segments: [
      ground(0, 1680),
      crate(860),
      pickup(1180, 'coin'),
      spike(1420),
      gap(1680, 120),
      ground(1800, 980),
      platform(2060, 250, 72),
      pickup(2480, 'jump-boost'),
      gap(2780, 170),
      platform(2950, 480, HIGH_RISE),
      pickup(3160, 'coin', GROUND_Y - HIGH_RISE - 52),
      gap(3430, 48),
      ground(3478, 920),
      spike(3820),
      pickup(4040, 'coin'),
      { type: 'finish', x: 4240 },
    ],
  },
  {
    id: 'step-up',
    name: 'Step Up',
    startSpeed: 280,
    accelPerSecond: 8,
    maxSpeed: 360,
    segments: [
      ground(0, 1120),
      crate(680),
      pickup(920, 'coin'),
      gap(1120, 160),
      ground(1280, 1420),
      pickup(1680, 'jump-boost'),
      spike(2080),
      platform(2280, 220, 72),
      gap(2700, 220),
      platform(2920, 500, HIGH_RISE),
      pickup(3140, 'coin', GROUND_Y - HIGH_RISE - 52),
      gap(3420, 56),
      ground(3476, 1080),
      crate(3920),
      pickup(4180, 'coin'),
      { type: 'finish', x: 4360 },
    ],
  },
  {
    id: 'rush',
    name: 'Rush',
    startSpeed: 350,
    accelPerSecond: 8,
    maxSpeed: 440,
    segments: [
      ground(0, 980),
      crate(520),
      pickup(760, 'coin'),
      gap(980, 160),
      ground(1140, 900),
      pickup(1420, 'jump-boost'),
      platform(1560, 200, 72),
      spike(1780),
      gap(2040, 240),
      platform(2280, 520, HIGH_RISE),
      pickup(2500, 'coin', GROUND_Y - HIGH_RISE - 52),
      gap(2800, 56),
      ground(2856, 700),
      spike(3120),
      gap(3556, 200),
      ground(3756, 960),
      pickup(4120, 'coin'),
      { type: 'finish', x: 4440 },
    ],
  },
]

export function getLevel(index: number): LevelConfig {
  const level = levels[index]
  if (!level) throw new Error(`Level ${index} not found`)
  return level
}

export function nextLevel(index: number, count: number): number | 'menu' {
  const next = index + 1
  return next < count ? next : 'menu'
}

export function worldWidth(level: LevelConfig): number {
  let max = 960
  for (const segment of level.segments) {
    if (segment.type === 'finish') max = Math.max(max, segment.x + 320)
    else if (segment.type === 'pickup') max = Math.max(max, segment.x + PICKUP_SIZE)
    else max = Math.max(max, segment.x + segment.width)
  }
  return max + 240
}
