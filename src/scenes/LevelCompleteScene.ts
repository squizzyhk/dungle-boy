import Phaser from 'phaser'
import { GAME_WIDTH, SCENE } from '../constants'
import { levels, nextLevel } from '../data/levels'
import { addButton } from '../ui/button'
import { FONT, INK } from '../ui/theme'

type CompleteData = {
  score: number
  levelIndex: number
  levelName: string
}

export class LevelCompleteScene extends Phaser.Scene {
  private levelIndex = 0
  private left = false

  constructor() {
    super(SCENE.complete)
  }

  init(data: CompleteData): void {
    this.levelIndex = data.levelIndex
  }

  create(data: CompleteData): void {
    this.add.rectangle(GAME_WIDTH / 2, 270, 960, 540, 0x1b1e2b, 0.55)
    this.add.rectangle(GAME_WIDTH / 2, 270, 480, 340, 0xfff6e4).setStrokeStyle(6, 0x2c3148)

    this.add
      .text(GAME_WIDTH / 2, 170, 'Level clear', {
        fontFamily: FONT,
        fontSize: '48px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 230, `${data.levelName}\nScore ${data.score}`, {
        fontFamily: FONT,
        fontSize: '24px',
        color: INK,
        align: 'center',
      })
      .setOrigin(0.5)

    const next = nextLevel(this.levelIndex, levels.length)
    addButton(
      this,
      GAME_WIDTH / 2,
      320,
      next === 'menu' ? 'Back to menu' : 'Next level',
      () => this.leave(next),
    )
    addButton(this, GAME_WIDTH / 2, 400, 'Menu', () => this.leave('menu'))

    this.input.keyboard?.once('keydown-SPACE', () => this.leave(next))
  }

  private leave(next: number | 'menu'): void {
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
