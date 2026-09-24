import type Phaser from 'phaser'
import { damageMask, maskTouchesPlayer, type HazardKind, type Rect } from './HazardShape'

type Mask = { pixels: Uint8Array; width: number; height: number }
const cache = new WeakMap<Phaser.Textures.Texture, Map<string, Mask>>()

export function touchesHazard(sprite: Phaser.GameObjects.Sprite, player: Rect): boolean {
  const kind = sprite.getData('hazardKind') as HazardKind
  const frame = sprite.frame
  const key = `${kind}:${frame.name}`
  let frames = cache.get(sprite.texture)
  if (!frames) { frames = new Map(); cache.set(sprite.texture, frames) }
  let mask = frames.get(key)
  if (!mask) {
    const canvas = document.createElement('canvas')
    canvas.width = frame.cutWidth; canvas.height = frame.cutHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })!
    context.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, canvas.width, canvas.height)
    const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data
    mask = { pixels: damageMask(rgba, canvas.width, canvas.height, kind, Number(frame.name) || 0), width: canvas.width, height: canvas.height }
    frames.set(key, mask)
  }
  return maskTouchesPlayer(mask.pixels, mask.width, mask.height, {
    x: sprite.x - sprite.displayOriginX * sprite.scaleX,
    y: sprite.y - sprite.displayOriginY * sprite.scaleY,
    width: sprite.displayWidth, height: sprite.displayHeight,
  }, player)
}
