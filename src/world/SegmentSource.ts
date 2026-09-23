import type { Segment, SegmentSource } from '../types'

export class AuthoredSegmentSource implements SegmentSource {
  readonly finishX: number | null
  private readonly segments: Segment[]
  private cursor = 0

  constructor(segments: Segment[]) {
    this.segments = [...segments].sort((a, b) => a.x - b.x)
    const finish = this.segments.find((segment) => segment.type === 'finish')
    this.finishX = finish ? finish.x : null
  }

  takeUntil(worldX: number): Segment[] {
    const ready: Segment[] = []
    while (this.cursor < this.segments.length && this.segments[this.cursor].x <= worldX) {
      ready.push(this.segments[this.cursor])
      this.cursor += 1
    }
    return ready
  }
}
