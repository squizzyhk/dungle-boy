import Phaser from 'phaser'
import { enterMenuMusic, addMusicControl } from '../audio/music'
import { GAME_WIDTH, SCENE } from '../constants'
import { addButton } from '../ui/button'
import { FONT, INK } from '../ui/theme'

type OverData = {
  score: number
  levelIndex: number
}

export class GameOverScene extends Phaser.Scene {
  private levelIndex = 0
  private left = false

  constructor() {
    super(SCENE.over)
  }

  init(data: OverData): void {
    this.left = false
    this.levelIndex = data.levelIndex
  }

  create(data: OverData): void {
    enterMenuMusic(this)
    addMusicControl(this)
    this.add.rectangle(GAME_WIDTH / 2, 270, 960, 540, 0x1b1e2b, 0.55)
    this.add.rectangle(GAME_WIDTH / 2, 294, 480, 368, 0x252542).setStrokeStyle(2, 0x92c8ee)

    this.add
      .text(GAME_WIDTH / 2, 180, 'Wiped out', {
        fontFamily: FONT,
        fontSize: '48px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 240, `Score ${data.score}`, {
        fontFamily: FONT,
        fontSize: '24px',
        color: INK,
      })
      .setOrigin(0.5)

    addButton(this, GAME_WIDTH / 2, 320, 'Retry', () => this.go(this.levelIndex))
    addButton(this, GAME_WIDTH / 2, 400, 'Menu', () => this.go('menu'))
    this.input.keyboard?.once('keydown-SPACE', () => this.go(this.levelIndex))
  }

  private go(next: number | 'menu'): void {
    if (this.left) return
    this.left = true
    this.scene.stop(SCENE.hud)
    if (next === 'menu') {
      this.scene.stop(SCENE.game)
      this.scene.start(SCENE.menu)
      return
    }
    this.scene.start(SCENE.game, { levelIndex: next })
  }
}
