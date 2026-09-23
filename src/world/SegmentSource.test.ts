import { describe, expect, it } from 'vitest'
import { AuthoredSegmentSource } from './SegmentSource'
import type { Segment } from '../types'

const segments: Segment[] = [
  { type: 'ground', x: 0, y: 448, width: 800, height: 140 },
  { type: 'gap', x: 800, width: 120 },
  { type: 'pickup', x: 500, y: 360, itemId: 'coin' },
  { type: 'finish', x: 1400 },
]

describe('AuthoredSegmentSource', () => {
  it('returns each segment once, in x order, up to the lookahead', () => {
    const source = new AuthoredSegmentSource([
      segments[3],
      segments[1],
      segments[0],
      segments[2],
    ])

    expect(source.finishX).toBe(1400)
    expect(source.takeUntil(500).map((segment) => segment.type)).toEqual([
      'ground',
      'pickup',
    ])
    expect(source.takeUntil(500)).toEqual([])
    expect(source.takeUntil(2000).map((segment) => segment.type)).toEqual([
      'gap',
      'finish',
    ])
  })
})
