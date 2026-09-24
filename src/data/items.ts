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
  'jump-orb': { ...jumpBoost, id: 'jump-orb' },
  'shield-orb': { id: 'shield-orb', label: 'Shield', kind: 'timed', durationMs: 6500, shield: 1 },
  'magnet-orb': { id: 'magnet-orb', label: 'Coin magnet', kind: 'timed', durationMs: 6000, magnetRadius: 150 },
  'speed-pad': { id: 'speed-pad', label: 'Speed pad', kind: 'timed', durationMs: 1800, speedMultiplier: 1.15 },
}

export function getItem(id: string): ItemDef {
  const item = catalog[id]
  if (!item) throw new Error(`Unknown item: ${id}`)
  return item
}
