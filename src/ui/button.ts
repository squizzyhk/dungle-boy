import Phaser from 'phaser'
import { FONT, INK } from './theme'

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const bg = scene.add
    .rectangle(x, y, 340, 58, 0xffd15c)
    .setStrokeStyle(5, 0x2c3148)
    .setInteractive({ useHandCursor: true })

  scene.add
    .text(x, y, label, {
      fontFamily: FONT,
      fontSize: '26px',
      color: INK,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)

  bg.on('pointerover', () => bg.setFillStyle(0xffe7a0))
  bg.on('pointerout', () => bg.setFillStyle(0xffd15c))
  bg.on('pointerdown', onClick)
}
