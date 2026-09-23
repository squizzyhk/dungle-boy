import type { ItemDef } from '../types'

export const coin: ItemDef = {
  id: 'coin',
  label: 'Coin',
  kind: 'instant',
  score: 10,
}

export const jumpBoost: ItemDef = {
  id: 'jump-boost',
  label: 'Jump boost',
  kind: 'timed',
  durationMs: 5000,
  jumpMultiplier: 1.35,
}

const catalog: Record<string, ItemDef> = {
  [coin.id]: coin,
  [jumpBoost.id]: jumpBoost,
}

export function getItem(id: string): ItemDef {
  const item = catalog[id]
  if (!item) throw new Error(`Unknown item: ${id}`)
  return item
}
