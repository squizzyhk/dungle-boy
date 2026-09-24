import {
  GROUND_HEIGHT,
  GROUND_Y,
  PICKUP_SIZE,
  PLATFORM_HEIGHT,
} from '../constants'
import type { LevelConfig, Segment } from '../types'

function ground(x: number, width: number): Segment {
  return { type: 'ground', x, y: GROUND_Y, width, height: GROUND_HEIGHT }
}

function platform(x: number, width: number, rise: number): Segment {
  return { type: 'platform', x, y: GROUND_Y - rise, width, height: PLATFORM_HEIGHT }
}

function reactor(x: number, width: number, height: number): Segment {
  return { type: 'obstacle', kind: 'crate', x, y: GROUND_Y - height, width, height }
}

function plasma(x: number, width: number, height = 34): Segment {
  return { type: 'obstacle', kind: 'spike', x, y: GROUND_Y - height, width, height }
}

function pickup(x: number, itemId = 'coin', rise = 0): Segment {
  return { type: 'pickup', x, y: GROUND_Y - rise - 52, itemId }
}

// Collectibles trace a jump without making the upper route compulsory.
function arc(x: number, width: number, rise: number): Segment[] {
  return [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
    pickup(x + width * fraction, 'coin', Math.sin(Math.PI * fraction) * rise),
  )
}

function gap(x: number, width: number): Segment {
  return { type: 'gap', x, width }
}

export const levels: LevelConfig[] = [
  {
    id: 'orbital-garden',
    name: 'Orbital Garden',
    startSpeed: 215,
    accelPerSecond: 5,
    maxSpeed: 280,
    segments: [
      // A long landing deck gives the little mallow room to find his feet.
      ground(0, 2140),
      pickup(440),
      pickup(520),
      reactor(820, 56, 54),
      ...arc(760, 180, 76),
      platform(1180, 260, 60),
      pickup(1230, 'coin', 60),
      pickup(1330, 'coin', 60),
      plasma(1660, 64, 30),
      ...arc(1600, 190, 70),
      ...arc(2070, 260, 78),
      gap(2140, 130),
      ground(2270, 1180),
      reactor(2510, 68, 56),
      ...arc(2450, 200, 78),
      platform(2820, 270, 68),
      pickup(2870, 'coin', 68),
      pickup(2990, 'jump-boost', 68),
      // This isolated relay needs a double jump even without the optional boost.
      gap(3450, 160),
      platform(3610, 500, 132),
      pickup(3660, 'coin', 132),
      pickup(3760, 'coin', 132),
      pickup(3860, 'coin', 132),
      pickup(3960, 'coin', 132),
      gap(4110, 60),
      ground(4170, 1530),
      plasma(4550, 80, 30),
      ...arc(4490, 210, 72),
      reactor(4930, 58, 54),
      ...arc(4860, 210, 78),
      pickup(5230),
      pickup(5310),
      pickup(5390),
      { type: 'finish', x: 5500 },
    ],
  },
  {
    id: 'relay-heights',
    name: 'Relay Heights',
    startSpeed: 275,
    accelPerSecond: 6,
    maxSpeed: 350,
    segments: [
      ground(0, 1690),
      pickup(430),
      pickup(510),
      reactor(740, 74, 58),
      ...arc(660, 240, 78),
      plasma(1200, 82),
      ...arc(1120, 250, 74),
      ...arc(1600, 340, 80),
      gap(1690, 180),
      ground(1870, 1740),
      platform(2120, 270, 64),
      pickup(2170, 'coin', 64),
      pickup(2270, 'coin', 64),
      pickup(2330, 'jump-boost', 64),
      reactor(2620, 82, 58),
      ...arc(2530, 260, 80),
      plasma(3070, 100, 36),
      ...arc(2980, 280, 74),
      gap(3610, 200),
      platform(3810, 580, 140),
      pickup(3870, 'coin', 140),
      pickup(3980, 'coin', 140),
      pickup(4090, 'coin', 140),
      pickup(4200, 'coin', 140),
      gap(4390, 70),
      ground(4460, 1900),
      reactor(4800, 82, 58),
      ...arc(4700, 270, 80),
      platform(5160, 300, 70),
      pickup(5220, 'coin', 70),
      pickup(5340, 'coin', 70),
      plasma(5680, 110),
      ...arc(5570, 300, 74),
      pickup(5980),
      pickup(6060),
      { type: 'finish', x: 6260 },
    ],
  },
  {
    id: 'stardust-sprint',
    name: 'Stardust Sprint',
    startSpeed: 330,
    accelPerSecond: 6,
    maxSpeed: 420,
    segments: [
      ground(0, 1540),
      pickup(430),
      pickup(520),
      reactor(760, 82, 62),
      ...arc(660, 290, 80),
      platform(1120, 220, 66),
      pickup(1170, 'coin', 66),
      pickup(1280, 'coin', 66),
      ...arc(1440, 390, 80),
      gap(1540, 220),
      ground(1760, 1710),
      plasma(2110, 112, 36),
      ...arc(1990, 320, 76),
      reactor(2710, 90, 64),
      ...arc(2590, 320, 82),
      platform(3000, 250, 72),
      pickup(3050, 'coin', 72),
      pickup(3160, 'jump-boost', 72),
      gap(3470, 220),
      platform(3690, 620, 140),
      pickup(3760, 'coin', 140),
      pickup(3880, 'coin', 140),
      pickup(4000, 'coin', 140),
      pickup(4120, 'coin', 140),
      gap(4310, 80),
      ground(4390, 920),
      plasma(4760, 120, 38),
      ...arc(4620, 350, 78),
      ...arc(5180, 440, 82),
      gap(5310, 240),
      ground(5550, 1650),
      reactor(5860, 92, 64),
      ...arc(5730, 340, 82),
      plasma(6360, 100, 36),
      ...arc(6220, 340, 76),
      pickup(6690),
      pickup(6780),
      pickup(6870),
      { type: 'finish', x: 7000 },
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
