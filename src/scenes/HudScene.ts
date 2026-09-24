import Phaser from 'phaser'
import { SCENE } from '../constants'
import type { HudState } from '../types'
import { CREAM, FONT } from '../ui/theme'

export class HudScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text
  private speedText!: Phaser.GameObjects.Text
  private metaText!: Phaser.GameObjects.Text
  private effectText!: Phaser.GameObjects.Text
  private pips: Phaser.GameObjects.Arc[] = []

  constructor() {
    super(SCENE.hud)
  }

  create(): void {
    this.pips = []
    this.add.rectangle(0, 0, 960, 64, 0x171d39, 0.78).setOrigin(0, 0)
    this.metaText = this.add.text(20, 18, '', {
      fontFamily: FONT,
      fontSize: '20px',
      color: CREAM,
      fontStyle: 'bold',
    })
    this.scoreText = this.add
      .text(480, 16, '', {
        fontFamily: FONT,
        fontSize: '28px',
        color: '#9efbf1',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
    this.speedText = this.add.text(790, 20, '', {
      fontFamily: FONT,
      fontSize: '18px',
      color: CREAM,
    }).setOrigin(1, 0)
    this.effectText = this.add.text(20, 74, '', {
      fontFamily: FONT,
      fontSize: '18px',
      color: '#e6f6ff',
      fontStyle: 'bold',
    })

    for (let index = 0; index < 2; index += 1) {
      this.pips.push(this.add.circle(900 + index * 24, 32, 8, 0x9efbf1).setStrokeStyle(3, 0xfff6e4))
    }

    const game = this.scene.get(SCENE.game)
    game.events.on('hud', this.render, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      game.events.off('hud', this.render, this)
    })
  }

  private render(state: HudState): void {
    this.metaText.setText(`${state.levelIndex + 1}/${state.levelCount}  ${state.levelName}`)
    this.scoreText.setText(String(state.score))
    this.speedText.setText(`Pace ${Math.round(state.speed)}`)
    this.effectText.setText(
      state.effects
        .map((effect) => `${effect.label} ${(effect.remainingMs / 1000).toFixed(1)}s`)
        .join('   '),
    )
    this.pips.forEach((pip, index) => {
      pip.setFillStyle(index < state.jumpsRemaining ? 0x9efbf1 : 0x171d39)
    })
  }
}
