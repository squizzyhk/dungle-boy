import Phaser from 'phaser'
import { RUN_FRAME_COUNT, strideAt, type LegPose } from '../entities/RunStride'

type Paint = CanvasRenderingContext2D

/** A soft, body-led run: short continuous leg lobes, tiny steps, no knees or shoes. */
export function createMallowRun(scene: Phaser.Scene): void {
  if (scene.textures.exists('mallow-run')) return
  const atlas = scene.textures.createCanvas('mallow-run', 192 * 8, 192 * 3)
  if (!atlas) return
  const c = atlas.context
  const body = scene.textures.get('mallow-body').getSourceImage() as HTMLImageElement
  const arm = scene.textures.get('mallow-arm').getSourceImage() as HTMLImageElement

  for (let i = 0; i < RUN_FRAME_COUNT; i++) {
    const col = i % 8, row = Math.floor(i / 8)
    const pose = strideAt(i / RUN_FRAME_COUNT)
    c.save()
    c.translate(col * 192, row * 192)
    drawArm(c, arm, 132, 124 + pose.bob, -0.55 - pose.armAngle, true)
    drawLeg(c, 100, 144 + pose.bob, pose.far, true)
    drawLeg(c, 94, 145 + pose.bob, pose.near, false)
    // Broader, gently forward-leaning torso overlaps the limb roots generously.
    c.save()
    c.translate(96, 158 + pose.bob)
    c.rotate(0.06)
    c.scale(1 + pose.squash, 1 - pose.squash)
    c.drawImage(body, -49, -95, 99, 95)
    c.restore()
    drawArm(c, arm, 61, 125 + pose.bob, 0.62 + pose.armAngle, false)
    c.restore()
    atlas.add(i, 0, col * 192, row * 192, 192, 192)
  }
  atlas.refresh()
}

function drawArm(c: Paint, image: HTMLImageElement, x: number, y: number, angle: number, far: boolean): void {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.filter = far ? 'brightness(0.9)' : 'none'
  c.drawImage(image, -10, -6, 22, 29)
  c.restore()
}

function drawLeg(c: Paint, hipX: number, hipY: number, pose: LegPose, far: boolean): void {
  const x = 96 + pose.x, y = pose.y
  // A single soft capsule grows straight from the body into a lumpy round end.
  // It has no independently rotating foot, ankle, or two-segment knee.
  const shade = c.createLinearGradient(x - 13, hipY, x + 12, y + 12)
  shade.addColorStop(0, far ? '#b7a9cf' : '#e3d9e8')
  shade.addColorStop(0.42, far ? '#d8cbe0' : '#fff5e7')
  shade.addColorStop(0.78, far ? '#c5b6d5' : '#efe0e4')
  shade.addColorStop(1, far ? '#a89abc' : '#c6b8d9')
  c.strokeStyle = shade
  c.lineWidth = 25
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(hipX, hipY)
  c.quadraticCurveTo(hipX, (hipY + y) / 2, x, y)
  c.stroke()
}
