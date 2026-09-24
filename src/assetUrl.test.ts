import { describe, expect, it } from 'vitest'
import { joinAssetUrl } from './assetUrl'

describe('joinAssetUrl', () => {
  it('keeps assets beneath the configured deployment folder', () => {
    expect(joinAssetUrl('/dungleboy/', '/assets/mallow.png')).toBe('/dungleboy/assets/mallow.png')
  })

  it('normalizes missing and repeated slashes', () => {
    expect(joinAssetUrl('/dungleboy', 'assets/mallow.png')).toBe('/dungleboy/assets/mallow.png')
    expect(joinAssetUrl('/', '/assets/mallow.png')).toBe('/assets/mallow.png')
  })
})
