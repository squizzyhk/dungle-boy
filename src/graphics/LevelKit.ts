import type Phaser from 'phaser'

/** Optional asset library for future levels. Call preloadLevelKit in scene.preload. */
export const levelKit = [
  { id: 'reactor-crate', category: 'obstacles', frames: 1, fps: 0, originY: .9375 },
  { id: 'crystal-cluster', category: 'obstacles', frames: 1, fps: 0, originY: .9375 },
  { id: 'retracting-spikes', category: 'obstacles', frames: 8, fps: 8, originY: .9375 },
  { id: 'plasma-rotor', category: 'obstacles', frames: 8, fps: 12, originY: .5 },
  { id: 'boost-pad', category: 'pads', frames: 8, fps: 10, originY: .9375 },
  { id: 'jump-orb', category: 'powerups', frames: 8, fps: 10, originY: .5 },
  { id: 'shield-orb', category: 'powerups', frames: 8, fps: 10, originY: .5 },
  { id: 'magnet-orb', category: 'powerups', frames: 8, fps: 10, originY: .5 },
] as const

export type LevelKitId = typeof levelKit[number]['id']

export function preloadLevelKit(scene: Phaser.Scene): void {
  for (const asset of levelKit) {
    const key = `level-kit:${asset.id}`
    if (!scene.textures.exists(key)) scene.load.spritesheet(key, `/assets/level-kit/${asset.category}/${asset.id}.png`, { frameWidth: 256, frameHeight: 256, endFrame: asset.frames - 1 })
  }
}

/** Visual only: the owning level supplies collision bodies, triggers, and effects. */
export function addLevelKitSprite(scene: Phaser.Scene, id: LevelKitId, x: number, y: number, scale = .5): Phaser.GameObjects.Sprite {
  const asset = levelKit.find(entry => entry.id === id)!
  const key = `level-kit:${asset.id}`
  if (!scene.textures.exists(key)) throw new Error(`Call preloadLevelKit before creating ${id}`)
  const sprite = scene.add.sprite(x, y, key).setOrigin(.5, asset.originY).setScale(scale)
  if (asset.frames > 1) {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(key, { start: 0, end: asset.frames - 1 }), frameRate: asset.fps, repeat: -1 })
    sprite.play(key)
  }
  return sprite
}
