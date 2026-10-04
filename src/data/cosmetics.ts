export const COSMETIC_CATEGORY_IDS = ['hat', 'shirt', 'shoes', 'outfit'] as const

export type CosmeticCategory = (typeof COSMETIC_CATEGORY_IDS)[number]

export const cosmeticCategories: readonly { id: CosmeticCategory; label: string }[] = [
  { id: 'hat', label: 'Hats' },
  { id: 'shirt', label: 'Shirts' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'outfit', label: 'Full outfits' },
]

export type CosmeticDef = {
  id: string
  label: string
  category: CosmeticCategory
}

// No cosmetic items exist yet. Add defs here and the unlock/equip system
// picks them up; unlock conditions arrive alongside the first batch.
export const cosmeticCatalog: CosmeticDef[] = []

export function getCosmetic(id: string): CosmeticDef {
  const def = cosmeticCatalog.find((cosmetic) => cosmetic.id === id)
  if (!def) throw new Error(`Unknown cosmetic: ${id}`)
  return def
}

export function cosmeticsInCategory(category: CosmeticCategory): CosmeticDef[] {
  return cosmeticCatalog.filter((cosmetic) => cosmetic.category === category)
}
