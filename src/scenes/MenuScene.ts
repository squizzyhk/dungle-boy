import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SCENE } from '../constants'
import { levels } from '../data/levels'
import { ensureTextures } from '../graphics/textures'
import { addButton } from '../ui/button'
import { FONT, INK } from '../ui/theme'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE.menu)
  }

  create(): void {
    ensureTextures(this)
    this.cameras.main.setBackgroundColor('#87d6ff')
    this.add.circle(820, 86, 38, 0xfff1a8)
    this.add.tileSprite(0, 36, GAME_WIDTH, 100, 'clouds').setOrigin(0, 0)
    this.add.tileSprite(0, 300, GAME_WIDTH, 110, 'hills').setOrigin(0, 0)
    this.add.tileSprite(0, 448, GAME_WIDTH, 140, 'ground').setOrigin(0, 0)

    this.add
      .text(GAME_WIDTH / 2, 78, 'Caspas', {
        fontFamily: FONT,
        fontSize: '72px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 142, 'Space, click, or tap to jump. Jump again in the air.', {
        fontFamily: FONT,
        fontSize: '20px',
        color: INK,
      })
      .setOrigin(0.5)

    levels.forEach((level, index) => {
      addButton(this, GAME_WIDTH / 2, 230 + index * 78, `${index + 1}. ${level.name}`, () => {
        this.scene.start(SCENE.game, { levelIndex: index })
      })
    })

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, 'The run speeds up. You only choose the jumps.', {
        fontFamily: FONT,
        fontSize: '16px',
        color: INK,
      })
      .setOrigin(0.5)
  }
}
