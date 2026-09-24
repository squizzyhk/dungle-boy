import type { ItemContext, ItemDef, RunModifiers } from '../types'

type ActiveEffect = {
  def: ItemDef
  remainingMs: number
  shieldLeft: number
}

const baseModifiers = (): RunModifiers => ({
  speedMultiplier: 1,
  jumpMultiplier: 1,
  scoreMultiplier: 1,
  shield: 0,
  magnetRadius: 0,
})

export class PowerupController {
  readonly modifiers: RunModifiers = baseModifiers()
  private effects: ActiveEffect[] = []
  private permanentShield = 0

  get activeEffects(): { id: string; label: string; remainingMs: number }[] {
    return this.effects.map((effect) => ({
      id: effect.def.id,
      label: effect.def.label,
      remainingMs: Math.max(0, effect.remainingMs),
    }))
  }

  collect(def: ItemDef, addScore: (amount: number) => void): void {
    if (def.score) {
      addScore(def.score * this.modifiers.scoreMultiplier)
    }

    if (def.kind === 'instant' && def.shield) {
      this.permanentShield += def.shield
    }

    if (def.kind === 'timed') {
      this.effects.push({
        def,
        remainingMs: def.durationMs ?? 0,
        shieldLeft: def.shield ?? 0,
      })
    }

    this.recompute()
    def.onCollect?.({ modifiers: this.modifiers, addScore })
  }

  update(dtMs: number): void {
    if (this.effects.length === 0) return

    const expired: ActiveEffect[] = []
    for (const effect of this.effects) {
      effect.remainingMs -= dtMs
      if (effect.remainingMs <= 0) expired.push(effect)
    }

    if (expired.length === 0) return

    this.effects = this.effects.filter((effect) => effect.remainingMs > 0)
    this.recompute()
    const ctx: ItemContext = { modifiers: this.modifiers, addScore: () => {} }
    for (const effect of expired) {
      effect.def.onExpire?.(ctx)
    }
  }

  tryAbsorbHit(): boolean {
    if (this.permanentShield > 0) {
      this.permanentShield -= 1
      this.recompute()
      return true
    }

    const effect = this.effects.find((entry) => entry.shieldLeft > 0)
    if (!effect) return false
    effect.shieldLeft -= 1
    this.recompute()
    return true
  }

  private recompute(): void {
    let speedMultiplier = 1
    let jumpMultiplier = 1
    let scoreMultiplier = 1
    let shield = this.permanentShield
    let magnetRadius = 0

    for (const effect of this.effects) {
      speedMultiplier *= effect.def.speedMultiplier ?? 1
      jumpMultiplier *= effect.def.jumpMultiplier ?? 1
      scoreMultiplier *= effect.def.scoreMultiplier ?? 1
      shield += effect.shieldLeft
      magnetRadius = Math.max(magnetRadius, effect.def.magnetRadius ?? 0)
    }

    this.modifiers.speedMultiplier = speedMultiplier
    this.modifiers.jumpMultiplier = jumpMultiplier
    this.modifiers.scoreMultiplier = scoreMultiplier
    this.modifiers.shield = shield
    this.modifiers.magnetRadius = magnetRadius
  }
}
