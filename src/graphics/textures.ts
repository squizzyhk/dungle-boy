import Phaser from 'phaser'
import {
  CRATE_HEIGHT,
  CRATE_WIDTH,
  FINISH_HEIGHT,
  FINISH_WIDTH,
  GROUND_HEIGHT,
  PICKUP_SIZE,
  PLATFORM_HEIGHT,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
} from '../constants'

export function ensureTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('player')) return

  drawPlayer(scene)
  drawGround(scene)
  drawPlatform(scene)
  drawCrate(scene)
  drawSpike(scene)
  drawCoin(scene)
  drawBoost(scene)
  drawFinish(scene)
  drawClouds(scene)
  drawHills(scene)
}

function drawPlayer(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xffd15c)
  g.fillRoundedRect(2, 4, PLAYER_WIDTH - 4, PLAYER_HEIGHT - 10, 10)
  g.fillStyle(0x2c3148)
  g.fillRoundedRect(6, PLAYER_HEIGHT - 10, 8, 8, 2)
  g.fillRoundedRect(PLAYER_WIDTH - 14, PLAYER_HEIGHT - 10, 8, 8, 2)
  g.fillStyle(0x2c3148)
  g.fillCircle(PLAYER_WIDTH - 13, 16, 2.5)
  g.fillCircle(PLAYER_WIDTH - 6, 16, 2.5)
  g.fillStyle(0xff7a59)
  g.fillCircle(PLAYER_WIDTH - 5, 22, 2.5)
  g.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT)
  g.destroy()
}

function drawGround(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xc4844a)
  g.fillRect(0, 16, 64, GROUND_HEIGHT - 16)
  g.fillStyle(0x67c85a)
  g.fillRoundedRect(0, 0, 64, 22, { tl: 6, tr: 6, bl: 0, br: 0 })
  g.fillStyle(0x8fe07a)
  g.fillRect(8, 6, 14, 5)
  g.fillRect(36, 8, 18, 4)
  g.generateTexture('ground', 64, GROUND_HEIGHT)
  g.destroy()
}

function drawPlatform(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xffb347)
  g.fillRoundedRect(0, 0, 32, PLATFORM_HEIGHT, 6)
  g.fillStyle(0xffe0a3)
  g.fillRect(4, 4, 16, 4)
  g.generateTexture('platform', 32, PLATFORM_HEIGHT)
  g.destroy()
}

function drawCrate(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xe07a32)
  g.fillRoundedRect(0, 0, CRATE_WIDTH, CRATE_HEIGHT, 6)
  g.lineStyle(4, 0x2c3148)
  g.strokeRoundedRect(2, 2, CRATE_WIDTH - 4, CRATE_HEIGHT - 4, 5)
  g.lineBetween(8, 8, CRATE_WIDTH - 8, CRATE_HEIGHT - 8)
  g.lineBetween(CRATE_WIDTH - 8, 8, 8, CRATE_HEIGHT - 8)
  g.generateTexture('crate', CRATE_WIDTH, CRATE_HEIGHT)
  g.destroy()
}

function drawSpike(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xff5d73)
  const tooth = SPIKE_WIDTH / 3
  for (let i = 0; i < 3; i += 1) {
    const left = i * tooth
    g.fillTriangle(left, SPIKE_HEIGHT, left + tooth / 2, 0, left + tooth, SPIKE_HEIGHT)
  }
  g.generateTexture('spike', SPIKE_WIDTH, SPIKE_HEIGHT)
  g.destroy()
}

function drawCoin(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xffe14a)
  g.fillCircle(16, 16, 14)
  g.fillStyle(0xfff6bf)
  g.fillCircle(12, 12, 5)
  g.lineStyle(3, 0x2c3148)
  g.strokeCircle(16, 16, 14)
  g.generateTexture('coin', PICKUP_SIZE, PICKUP_SIZE)
  g.destroy()
}

function drawBoost(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0x5ddec0)
  g.fillCircle(16, 16, 14)
  g.fillStyle(0xfff6e4)
  g.fillTriangle(16, 5, 20, 16, 12, 16)
  g.fillTriangle(16, 27, 12, 16, 20, 16)
  g.lineStyle(3, 0x2c3148)
  g.strokeCircle(16, 16, 14)
  g.generateTexture('jump-boost', PICKUP_SIZE, PICKUP_SIZE)
  g.destroy()
}

function drawFinish(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xfff6e4)
  g.fillRoundedRect(4, 0, 8, FINISH_HEIGHT, 3)
  g.fillStyle(0xff5d8f)
  g.fillTriangle(12, 8, 44, 22, 12, 36)
  g.lineStyle(3, 0x2c3148)
  g.strokeTriangle(12, 8, 44, 22, 12, 36)
  g.generateTexture('finish', FINISH_WIDTH, FINISH_HEIGHT)
  g.destroy()
}

function drawClouds(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0xffffff, 0.95)
  g.fillCircle(40, 48, 18)
  g.fillCircle(62, 42, 24)
  g.fillCircle(86, 50, 16)
  g.fillCircle(150, 70, 14)
  g.fillCircle(168, 64, 18)
  g.generateTexture('clouds', 220, 100)
  g.destroy()
}

function drawHills(scene: Phaser.Scene): void {
  const g = scene.add.graphics()
  g.fillStyle(0x3caf72)
  g.fillEllipse(70, 78, 150, 90)
  g.fillEllipse(180, 88, 120, 70)
  g.fillStyle(0x7ddea0)
  g.fillEllipse(40, 70, 90, 60)
  g.generateTexture('hills', 240, 110)
  g.destroy()
}
