import { COSMETIC_CATEGORY_IDS, type CosmeticCategory } from '../data/cosmetics'

const STORAGE_KEY = 'dungle-boy.cosmetics.v1'
const SAVE_VERSION = 1

export type EquippedCosmetics = Record<CosmeticCategory, string | null>

export type CosmeticSave = {
  version: number
  unlocked: string[]
  equipped: EquippedCosmetics
}

export type CosmeticStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type EffectivePieces = {
  hat: string | null
  shirt: string | null
  shoes: string | null
}

function freshSave(): CosmeticSave {
  const equipped = {} as EquippedCosmetics
  for (const category of COSMETIC_CATEGORY_IDS) equipped[category] = null
  return { version: SAVE_VERSION, unlocked: [], equipped }
}

function parseSave(raw: string | null): CosmeticSave | null {
  if (raw === null) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  if (record.version !== SAVE_VERSION) return null

  const save = freshSave()
  if (Array.isArray(record.unlocked)) {
    for (const id of record.unlocked) {
      if (typeof id === 'string') save.unlocked.push(id)
    }
  }
  if (typeof record.equipped === 'object' && record.equipped !== null) {
    const slots = record.equipped as Record<string, unknown>
    for (const category of COSMETIC_CATEGORY_IDS) {
      const value = slots[category]
      if (typeof value === 'string') save.equipped[category] = value
    }
  }
  return save
}

function defaultStorage(): CosmeticStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

export class CosmeticsController {
  private readonly storage: CosmeticStorage | null
  private readonly unlockedIds = new Set<string>()
  private equipped: EquippedCosmetics

  constructor(storage?: CosmeticStorage) {
    this.storage = storage ?? defaultStorage()
    let raw: string | null = null
    try {
      raw = this.storage?.getItem(STORAGE_KEY) ?? null
    } catch {
      raw = null
    }
    const save = parseSave(raw) ?? freshSave()
    this.unlockedIds = new Set(save.unlocked)
    this.equipped = save.equipped
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds.has(id)
  }

  // Returns true only when the unlock is new, so callers can celebrate it.
  unlock(id: string): boolean {
    if (this.unlockedIds.has(id)) return false
    this.unlockedIds.add(id)
    this.writeSave()
    return true
  }

  // Equipping only accepts unlocked ids; pass null to clear a slot.
  equip(category: CosmeticCategory, id: string | null): boolean {
    if (id !== null && !this.unlockedIds.has(id)) return false
    if (this.equipped[category] === id) return false
    this.equipped[category] = id
    this.writeSave()
    return true
  }

  equippedIn(category: CosmeticCategory): string | null {
    return this.equipped[category]
  }

  isEquipped(id: string): boolean {
    return COSMETIC_CATEGORY_IDS.some((category) => this.equipped[category] === id)
  }

  // What the boy actually wears: a full outfit covers the individual slots
  // without clearing them, so removing the outfit restores the pieces.
  effectivePieces(): EffectivePieces {
    const outfit = this.equipped.outfit
    if (outfit !== null) return { hat: outfit, shirt: outfit, shoes: outfit }
    return { hat: this.equipped.hat, shirt: this.equipped.shirt, shoes: this.equipped.shoes }
  }

  isWorn(id: string): boolean {
    const pieces = this.effectivePieces()
    return pieces.hat === id || pieces.shirt === id || pieces.shoes === id
  }

  private writeSave(): void {
    if (!this.storage) return
    const save: CosmeticSave = {
      version: SAVE_VERSION,
      unlocked: [...this.unlockedIds],
      equipped: { ...this.equipped },
    }
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(save))
    } catch {
      // Storage can reject (private browsing, quota); the session keeps working.
    }
  }
}

let shared: CosmeticsController | null = null

export function getCosmetics(): CosmeticsController {
  shared ??= new CosmeticsController()
  return shared
}
