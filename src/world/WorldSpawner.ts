import Phaser from 'phaser'
import {
  FINISH_HEIGHT,
  FINISH_WIDTH,
  GROUND_Y,
  PICKUP_SIZE,
} from '../constants'
import type { Segment, SegmentSource } from '../types'
import { FinishGate } from '../graphics/FinishGate'

type Piece = Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite

export class WorldSpawner {
  private readonly pieces: Piece[] = []

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly source: SegmentSource,
    private readonly platforms: Phaser.Physics.Arcade.StaticGroup,
    private readonly hazards: Phaser.Physics.Arcade.StaticGroup,
    private readonly pickups: Phaser.Physics.Arcade.StaticGroup,
    private readonly finish: Phaser.Physics.Arcade.StaticGroup,
  ) {}

  update(aheadX: number, behindX: number): void {
    for (const segment of this.source.takeUntil(aheadX)) {
      const piece = this.spawn(segment)
      if (piece) this.pieces.push(piece)
    }

    for (let index = this.pieces.length - 1; index >= 0; index -= 1) {
      const piece = this.pieces[index]
      if (piece.x + piece.displayWidth < behindX) {
        piece.destroy()
        this.pieces.splice(index, 1)
      }
    }
  }

  private spawn(segment: Segment): Piece | null {
    switch (segment.type) {
      case 'gap':
        return null
      case 'ground':
        return this.addTile(this.platforms, segment.x, segment.y, segment.width, segment.height, 'ground', 2)
      case 'platform':
        return this.addTile(this.platforms, segment.x, segment.y, segment.width, segment.height, 'platform', 3)
      case 'obstacle':
        return this.addSprite(
          this.hazards,
          segment.x,
          segment.y,
          segment.width,
          segment.height,
          segment.kind,
          4,
        )
      case 'pickup':
        return this.addSprite(
          this.pickups,
          segment.x,
          segment.y,
          PICKUP_SIZE,
          PICKUP_SIZE,
          segment.itemId,
          5,
        ).setData('itemId', segment.itemId)
      case 'finish': {
        // Only the mast is a finish trigger; its flag and beacon are decorative.
        const marker = this.addSprite(
          this.finish,
          segment.x + 10,
          GROUND_Y - FINISH_HEIGHT,
          Math.min(20, FINISH_WIDTH),
          FINISH_HEIGHT,
          'finish',
          6,
        )
        marker.setVisible(false)
        const gate = new FinishGate(this.scene, segment.x, GROUND_Y)
        marker.setData('finishGate', gate)
        marker.once(Phaser.GameObjects.Events.DESTROY, () => gate.destroy())
        return marker
      }
    }
  }

  private addTile(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
    texture: string,
    depth: number,
  ): Phaser.GameObjects.TileSprite {
    const tile = this.scene.add.tileSprite(x, y, width, height, texture).setOrigin(0, 0).setDepth(depth)
    this.scene.physics.add.existing(tile, true)
    ;(tile.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
    group.add(tile)
    return tile
  }

  private addSprite(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
    texture: string,
    depth: number,
  ): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(x, y, texture).setOrigin(0, 0).setDepth(depth)
    sprite.setDisplaySize(width, height)
    this.scene.physics.add.existing(sprite, true)
    ;(sprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
    group.add(sprite)
    return sprite
  }
}
