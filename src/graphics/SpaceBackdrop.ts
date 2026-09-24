import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants'

export class SpaceBackdrop {
  private readonly painting: Phaser.GameObjects.Image
  private readonly motes: Phaser.GameObjects.Arc[] = []
  private readonly structures: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, key = 'orbital-garden') {
    this.painting = scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(0).setDepth(-10)
    this.painting.setDisplaySize(GAME_WIDTH + 180, GAME_HEIGHT + 102)
    // A few quiet courier lights add parallax without covering the painted architecture.
    this.structures = scene.add.graphics().setScrollFactor(0).setDepth(-7)
    for (let i = 0; i < 7; i++) {
      const x = i * 280 + 160, y = 275 + (i % 3) * 36
      this.structures.fillStyle(0x313f68, .6)
      this.structures.fillEllipse(x, y, 24, 5)
      this.structures.fillEllipse(x + 2, y - 2, 9, 4)
      this.structures.lineStyle(1, 0xa3f2ee, .45)
      this.structures.lineBetween(x - 8, y + 1, x + 8, y + 1)
      this.structures.lineStyle(1, 0xa3f2ee, .12)
      this.structures.lineBetween(x - 40, y, x - 16, y)
    }
    scene.add.image(0, 330, 'mist').setOrigin(0).setDisplaySize(GAME_WIDTH, 170).setScrollFactor(0).setDepth(-6)
    for (let i = 0; i < 18; i++) {
      this.motes.push(scene.add.circle(0,0,i%3===0?1.5:.7,0xd4fff4,.2+(i%4)*.1).setScrollFactor(0).setDepth(-5))
    }
  }

  update(time: number, scroll: number): void {
    this.painting.x = -Math.min(180, scroll * .024)
    this.structures.x = -(scroll * .16) % 280
    this.motes.forEach((mote,i) => {
      mote.x = ((i*167.7 - scroll*.09 + time*.006*(1+i%3)) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH
      mote.y = 90 + (i*53.7)%350 + Math.sin(time*.0006+i)*12
    })
  }
}

