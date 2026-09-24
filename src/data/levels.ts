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

function hazard(x: number, kind: 'reactor-crate' | 'crystal-cluster' | 'retracting-spikes' | 'plasma-rotor', size = 96, rise = 0, phase = 0): Segment {
  return { type: 'obstacle', kind, x, y: GROUND_Y - rise - size * .9375, width: size, height: size, phase }
}

function pad(x: number): Segment {
  return { type: 'pad', x, y: GROUND_Y - 96 * .9375, width: 112, height: 96 }
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
    id: 'crystal-aqueduct',
    name: 'Crystal Aqueduct',
    background: 'crystal-aqueduct',
    startSpeed: 275,
    accelPerSecond: 6,
    maxSpeed: 350,
    segments: [
      // Crystal promenade: learn one silhouette at a time, with recovery room.
      ground(0, 1940), pickup(430), pickup(510),
      hazard(860, 'crystal-cluster', 84), ...arc(790, 250, 95),
      platform(1160, 200, 60), pickup(1210, 'shield-orb', 64), pickup(1320, 'coin', 64),
      hazard(1590, 'retracting-spikes', 90), ...arc(1500, 290, 100),
      gap(1940, 155), ...arc(1850, 320, 90),
      ground(2095, 1205),
      hazard(2420, 'plasma-rotor', 88), ...arc(2330, 290, 100),
      pickup(2790, 'magnet-orb'), ...arc(2900, 230, 60),
      // A staircase of isolated aqueduct islands, unlike the garden's single relay.
      gap(3300, 150), platform(3450, 400, 124),
      pickup(3490, 'coin', 124), pickup(3590, 'coin', 124), pickup(3690, 'coin', 124),
      gap(3850, 120), platform(3970, 450, 166),
      pickup(4040, 'coin', 166), pickup(4150, 'coin', 166), pickup(4270, 'coin', 166),
      gap(4420, 160), ground(4580, 2320),
      hazard(4910, 'reactor-crate', 72), ...arc(4820, 280, 100),
      pad(5300), pickup(5510),
      hazard(5740, 'retracting-spikes', 90, 0, 4), ...arc(5640, 310, 105),
      hazard(6210, 'crystal-cluster', 84), ...arc(6110, 300, 100),
      platform(6480, 220, 54), pickup(6530, 'jump-orb', 58), pickup(6650, 'coin', 58),
      { type: 'finish', x: 6800 },
    ],
  },
  {
    id: 'ember-foundry',
    name: 'Ember Foundry',
    background: 'ember-foundry',
    startSpeed: 330,
    accelPerSecond: 6,
    maxSpeed: 420,
    segments: [
      // Furnace floor: closer encounters, then a low passage beneath a suspended rotor.
      ground(0, 2780), pickup(430), pickup(520),
      hazard(850, 'reactor-crate', 72), ...arc(740, 310, 108),
      hazard(1270, 'crystal-cluster', 88), ...arc(1160, 310, 108),
      hazard(1690, 'retracting-spikes', 92, 0, 2), ...arc(1580, 310, 108),
      hazard(2190, 'plasma-rotor', 96, 118), pickup(2230), pickup(2370, 'magnet-orb'),
      gap(2780, 210), ...arc(2650, 410, 95),
      ground(2990, 1710),
      hazard(3240, 'plasma-rotor', 92), ...arc(3120, 330, 105),
      hazard(3670, 'retracting-spikes', 92, 0, 5), ...arc(3550, 330, 108),
      platform(3920, 250, 62), pickup(3990, 'shield-orb', 66), pickup(4090, 'coin', 66),
      hazard(4420, 'crystal-cluster', 88), ...arc(4300, 330, 108),
      // Two short furnace bridges require separate jumps and landings.
      gap(4700, 175), platform(4875, 440, 130),
      pickup(4930, 'coin', 130), pickup(5050, 'coin', 130), pickup(5170, 'coin', 130),
      gap(5315, 170), platform(5485, 425, 96),
      pickup(5570, 'coin', 96), pickup(5690, 'coin', 96), pickup(5810, 'coin', 96),
      gap(5910, 170), ground(6080, 2720),
      hazard(6410, 'reactor-crate', 72), ...arc(6290, 320, 108),
      pad(6700),
      hazard(7170, 'plasma-rotor', 92), ...arc(7040, 340, 108),
      hazard(7650, 'retracting-spikes', 92, 0, 6), ...arc(7520, 340, 110),
      hazard(8110, 'crystal-cluster', 88), ...arc(7980, 340, 108),
      pickup(8400, 'jump-orb'), pickup(8490),
      { type: 'finish', x: 8700 },
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
