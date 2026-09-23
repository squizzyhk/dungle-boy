export type RunModifiers = {
  speedMultiplier: number
  jumpMultiplier: number
  scoreMultiplier: number
  shield: number
}

export type ItemContext = {
  modifiers: RunModifiers
  addScore: (amount: number) => void
}

export type ItemDef = {
  id: string
  label: string
  kind: 'instant' | 'timed'
  durationMs?: number
  score?: number
  speedMultiplier?: number
  jumpMultiplier?: number
  scoreMultiplier?: number
  shield?: number
  onCollect?: (ctx: ItemContext) => void
  onExpire?: (ctx: ItemContext) => void
}

export type Segment =
  | { type: 'ground'; x: number; y: number; width: number; height: number }
  | { type: 'platform'; x: number; y: number; width: number; height: number }
  | {
      type: 'obstacle'
      x: number
      y: number
      width: number
      height: number
      kind: 'crate' | 'spike'
    }
  | { type: 'gap'; x: number; width: number }
  | { type: 'pickup'; x: number; y: number; itemId: string }
  | { type: 'finish'; x: number }

export type LevelConfig = {
  id: string
  name: string
  startSpeed: number
  accelPerSecond: number
  maxSpeed: number
  segments: Segment[]
}

export interface SegmentSource {
  readonly finishX: number | null
  takeUntil(worldX: number): Segment[]
}

export type HudEffect = {
  id: string
  label: string
  remainingMs: number
}

export type HudState = {
  score: number
  levelName: string
  levelIndex: number
  levelCount: number
  speed: number
  jumpsRemaining: number
  effects: HudEffect[]
}
