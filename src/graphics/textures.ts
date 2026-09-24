import Phaser from 'phaser'
import { createMallowRun } from './MallowRun'
import { CRATE_HEIGHT, CRATE_WIDTH, FINISH_HEIGHT, FINISH_WIDTH, GROUND_HEIGHT, PICKUP_SIZE, PLATFORM_HEIGHT, PLAYER_HEIGHT, PLAYER_WIDTH, SPIKE_HEIGHT, SPIKE_WIDTH } from '../constants'

type Paint = CanvasRenderingContext2D
function texture(scene: Phaser.Scene, key: string, w: number, h: number, paint: (c: Paint) => void): void {
  const tex = scene.textures.createCanvas(key, w, h)
  if (!tex) return
  paint(tex.context)
  tex.refresh()
}
function gradient(c: Paint, x: number, y: number, colors: string[]): CanvasGradient {
  const g = c.createLinearGradient(0, 0, x, y)
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color))
  return g
}
function box(c: Paint, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient): void {
  c.fillStyle = fill
  c.beginPath(); c.roundRect(x, y, w, h, r); c.fill()
}
function ellipse(c: Paint, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient): void {
  c.fillStyle = fill
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill()
}

export function preloadArtwork(scene: Phaser.Scene): void {
  for (const part of ['body', 'arm']) scene.load.image(`mallow-${part}`, `/assets/mallow-${part}.png`)
  scene.load.image('orbital-garden', '/assets/orbital-garden.webp')
  scene.load.spritesheet('mallow', '/assets/mallow-atlas.png', { frameWidth: 192, frameHeight: 192 })
}

export function ensureTextures(scene: Phaser.Scene): void {
  createMallowRun(scene)
  if (scene.textures.exists('player')) return
  // A separate invisible physics sprite keeps soft visual deformation out of collision calculations.
  texture(scene, 'player', PLAYER_WIDTH, PLAYER_HEIGHT, c => box(c, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 0, '#fff'))
  texture(scene, 'ground', 256, GROUND_HEIGHT, c => {
    box(c, 0, 0, 256, GROUND_HEIGHT, 0, gradient(c, 0, GROUND_HEIGHT, ['#7e83a6', '#313851', '#151c34']))
    box(c, 0, 0, 256, 5, 0, '#d1e8ec')
    box(c, 0, 5, 256, 3, 0, '#6ffbea')
    box(c, 0, 10, 256, 13, 0, gradient(c, 0, 23, ['#9296b0', '#535b7f']))
    for (const x of [0, 128]) {
      box(c, x + 5, 29, 118, 74, 7, '#202b46')
      box(c, x + 7, 31, 114, 68, 5, gradient(c, 0, 100, ['#414967', '#1a223b']))
      box(c, x + 19, 43, 64, 3, 1, '#748298')
      for (let i = 0; i < 4; i++) box(c, x + 21 + i * 13, 62, 5, 17, 2, '#182037')
      box(c, x + 99, 43, 5, 33, 2, '#4dbbad')
      box(c, x + 100, 43, 3, 18, 1, '#9cfff1')
      for (const dx of [14, 113]) ellipse(c, x + dx, 90, 2, 2, '#a1a9bb')
      c.strokeStyle = '#506480'; c.lineWidth = 2
      c.beginPath(); c.moveTo(x+9,113); c.lineTo(x+52,133); c.lineTo(x+105,113); c.stroke()
    }
  })
  texture(scene, 'platform', 128, PLATFORM_HEIGHT, c => {
    box(c, 0, 0, 128, PLATFORM_HEIGHT, 5, gradient(c, 0, PLATFORM_HEIGHT, ['#d4e7f1', '#7c80a3', '#293650']))
    box(c, 0, 0, 128, 3, 0, '#e7fff7')
    box(c, 8, 5, 112, 2, 0, '#7ffff1')
    box(c, 24, 13, 80, 7, 2, '#283451')
    box(c, 42, 15, 44, 3, 1, '#66eadf')
    for (const x of [10, 116]) ellipse(c, x, 14, 2, 2, '#c2d0df')
  })
  texture(scene, 'crate', CRATE_WIDTH, CRATE_HEIGHT, c => {
    box(c, 0, 0, CRATE_WIDTH, CRATE_HEIGHT, 7, gradient(c, 48, 64, ['#edcee8', '#8c6d9f', '#343448']))
    box(c, 4, 5, 40, 54, 5, '#2c2d46')
    box(c, 8, 9, 32, 45, 5, gradient(c, 0, 60, ['#6c4a77', '#29273f']))
    ellipse(c, 24, 31, 13, 17, gradient(c, 0, 54, ['#ffeee9', '#ff97c0', '#b853cc']))
    ellipse(c, 24, 30, 7, 12, '#572b62')
    ellipse(c, 23, 28, 3, 8, '#ffded6')
    for (const y of [3, 54]) box(c, 9, y, 30, 6, 2, '#bac1d2')
    for (const x of [4, 40]) box(c, x, 17, 4, 24, 1, '#80799e')
    box(c, 13, 58, 22, 3, 1, '#ffb998')
  })
  texture(scene, 'spike', SPIKE_WIDTH, SPIKE_HEIGHT, c => {
    for (let i = 0; i < 3; i++) {
      const x = i * SPIKE_WIDTH / 3
      c.fillStyle = gradient(c, 0, SPIKE_HEIGHT, ['#fff9f3', '#ff9cbb', '#ae5fe4'])
      c.beginPath(); c.moveTo(x, SPIKE_HEIGHT-3); c.lineTo(x+SPIKE_WIDTH/6, 0); c.lineTo(x+SPIKE_WIDTH/3, SPIKE_HEIGHT-3); c.fill()
      c.fillStyle = '#fff5ff'; c.beginPath(); c.moveTo(x+5,29); c.lineTo(x+7.3,7); c.lineTo(x+9,29); c.fill()
    }
    box(c, 0, 30, SPIKE_WIDTH, 6, 2, gradient(c,0,36,['#eac9e5','#545169']))
  })
  for (const [key, colors] of [['coin', ['#fff5b3', '#ffc980', '#ec75bc']], ['jump-boost', ['#dcfffa', '#60edee', '#776bfa']]] as const) {
    texture(scene, key, PICKUP_SIZE, PICKUP_SIZE, c => {
      ellipse(c, 16, 16, 14, 14, gradient(c, 30, 32, [...colors]))
      ellipse(c, 16, 16, 10, 10, '#343050')
      c.strokeStyle = colors[0]; c.lineWidth = 2
      c.beginPath(); c.moveTo(16,7); c.lineTo(22,16); c.lineTo(16,25); c.lineTo(10,16); c.closePath(); c.stroke()
      if (key === 'jump-boost') { c.beginPath(); c.moveTo(11,17); c.lineTo(16,12); c.lineTo(21,17); c.stroke() }
    })
  }
  texture(scene, 'finish', FINISH_WIDTH, FINISH_HEIGHT, c => box(c,0,0,FINISH_WIDTH,FINISH_HEIGHT,0,'#fff'))
  texture(scene, 'mist', 512, 160, c => {
    const g = c.createLinearGradient(0,0,0,160)
    g.addColorStop(0,'#b9bbef00'); g.addColorStop(.65,'#c4ace51c'); g.addColorStop(1,'#93b2ea00')
    box(c,0,0,512,160,0,g)
  })
}
