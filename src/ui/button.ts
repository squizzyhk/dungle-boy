import Phaser from 'phaser'
import { playSfx } from '../audio/sfx'
import { FONT, INK } from './theme'

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const bg = scene.add
    .rectangle(x, y, 340, 58, 0x34345d)
    .setStrokeStyle(2, 0x92c8ee)
    .setInteractive({ useHandCursor: true })

  scene.add
    .text(x, y, label, {
      fontFamily: FONT,
      fontSize: '26px',
      color: INK,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)

  bg.on('pointerover', (pointer: Phaser.Input.Pointer) => {
    bg.setFillStyle(0x60518c)
    if (!pointer.wasTouch) playSfx(scene, 'hover')
  })
  bg.on('pointerout', () => bg.setFillStyle(0x34345d))
  bg.on('pointerdown', () => { playSfx(scene, 'button'); onClick() })
}
