import { describe, expect, it } from 'vitest'
import { CosmeticsController, type CosmeticStorage } from './CosmeticsController'

class MemoryStorage implements CosmeticStorage {
  private readonly entries = new Map<string, string>()

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value)
  }
}

function storageWith(raw: string | null): CosmeticStorage {
  return {
    getItem: () => raw,
    setItem: () => {},
  }
}

describe('CosmeticsController', () => {
  it('reports a fresh unlock once and remembers it', () => {
    const cosmetics = new CosmeticsController()
    expect(cosmetics.isUnlocked('party-hat')).toBe(false)
    expect(cosmetics.unlock('party-hat')).toBe(true)
    expect(cosmetics.isUnlocked('party-hat')).toBe(true)
    expect(cosmetics.unlock('party-hat')).toBe(false)
  })

  it('equips only unlocked cosmetics and clears slots with null', () => {
    const cosmetics = new CosmeticsController()
    expect(cosmetics.equip('hat', 'party-hat')).toBe(false)
    expect(cosmetics.equippedIn('hat')).toBeNull()

    cosmetics.unlock('party-hat')
    expect(cosmetics.equip('hat', 'party-hat')).toBe(true)
    expect(cosmetics.equippedIn('hat')).toBe('party-hat')
    expect(cosmetics.isEquipped('party-hat')).toBe(true)
    expect(cosmetics.equip('hat', 'party-hat')).toBe(false)

    expect(cosmetics.equip('hat', null)).toBe(true)
    expect(cosmetics.equippedIn('hat')).toBeNull()
    expect(cosmetics.isEquipped('party-hat')).toBe(false)
    expect(cosmetics.isUnlocked('party-hat')).toBe(true)
  })

  it('lets a full outfit cover the individual slots without clearing them', () => {
    const cosmetics = new CosmeticsController()
    for (const id of ['straw-hat', 'sparkle-shirt', 'moon-boots', 'cosmo-suit']) {
      cosmetics.unlock(id)
    }
    cosmetics.equip('hat', 'straw-hat')
    cosmetics.equip('shirt', 'sparkle-shirt')
    cosmetics.equip('shoes', 'moon-boots')

    expect(cosmetics.equip('outfit', 'cosmo-suit')).toBe(true)
    expect(cosmetics.effectivePieces()).toEqual({
      hat: 'cosmo-suit',
      shirt: 'cosmo-suit',
      shoes: 'cosmo-suit',
    })
    expect(cosmetics.isWorn('straw-hat')).toBe(false)
    expect(cosmetics.isWorn('cosmo-suit')).toBe(true)
    expect(cosmetics.equippedIn('hat')).toBe('straw-hat')

    cosmetics.equip('outfit', null)
    expect(cosmetics.effectivePieces()).toEqual({
      hat: 'straw-hat',
      shirt: 'sparkle-shirt',
      shoes: 'moon-boots',
    })
  })

  it('carries unlocks and equipped slots into a new controller over shared storage', () => {
    const storage = new MemoryStorage()
    const first = new CosmeticsController(storage)
    first.unlock('party-hat')
    first.unlock('cosmo-suit')
    first.equip('shirt', 'party-hat')
    first.equip('outfit', 'cosmo-suit')

    const second = new CosmeticsController(storage)
    expect(second.isUnlocked('party-hat')).toBe(true)
    expect(second.isUnlocked('cosmo-suit')).toBe(true)
    expect(second.equippedIn('shirt')).toBe('party-hat')
    expect(second.equippedIn('outfit')).toBe('cosmo-suit')
    expect(second.effectivePieces()).toEqual({
      hat: 'cosmo-suit',
      shirt: 'cosmo-suit',
      shoes: 'cosmo-suit',
    })
  })

  it('falls back to a fresh save when stored data is unusable', () => {
    for (const raw of [null, '', 'not json', '42', '"string"', '{"version":99,"unlocked":[]}']) {
      const cosmetics = new CosmeticsController(storageWith(raw))
      expect(cosmetics.isUnlocked('party-hat')).toBe(false)
      expect(cosmetics.equippedIn('hat')).toBeNull()
    }

    const junk = JSON.stringify({
      version: 1,
      unlocked: ['good-id', 7, null, { nope: true }],
      equipped: { hat: 'straw-hat', shoes: 3, outfit: undefined, extra: 'ignored' },
    })
    const cosmetics = new CosmeticsController(storageWith(junk))
    expect(cosmetics.isUnlocked('good-id')).toBe(true)
    expect(cosmetics.isUnlocked('7')).toBe(false)
    expect(cosmetics.equippedIn('hat')).toBe('straw-hat')
    expect(cosmetics.equippedIn('shoes')).toBeNull()
  })

  it('keeps working when storage is missing or rejects writes', () => {
    const withoutStorage = new CosmeticsController()
    expect(withoutStorage.unlock('party-hat')).toBe(true)
    expect(withoutStorage.equip('hat', 'party-hat')).toBe(true)
    expect(withoutStorage.equippedIn('hat')).toBe('party-hat')

    const rejecting: CosmeticStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
    }
    const stubborn = new CosmeticsController(rejecting)
    expect(stubborn.unlock('party-hat')).toBe(true)
    expect(stubborn.isUnlocked('party-hat')).toBe(true)
  })
})
