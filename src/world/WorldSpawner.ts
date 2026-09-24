import Phaser from 'phaser'
import {
  FINISH_HEIGHT,
  FINISH_WIDTH,
  GROUND_Y,
  PICKUP_SIZE,
} from '../constants'
import type { Segment, SegmentSource } from '../types'
import { FinishGate } from '../graphics/FinishGate'
import { addLevelKitSprite, type LevelKitId } from '../graphics/LevelKit'

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
    private readonly theme?: string,
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

  attractCoins(x: number, y: number, radius: number, dt: number): void {
    if (!radius) return
    for (const piece of this.pieces) {
      if (!piece.active || piece.getData('itemId') !== 'coin') continue
      const dx = x - (piece.x + piece.displayWidth / 2), dy = y - (piece.y + piece.displayHeight / 2)
      const distance = Math.hypot(dx, dy)
      if (distance > radius) continue
      const step = Math.min(1, dt * .012)
      piece.x += dx * step; piece.y += dy * step
      ;(piece.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
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
        if (segment.kind !== 'crate' && segment.kind !== 'spike') {
          const sprite = this.addKit(this.hazards, segment.kind, segment.x, segment.y, segment.width, segment.height)
          sprite.setData('hazardKind', segment.kind)
          if (segment.kind === 'retracting-spikes' || segment.kind === 'plasma-rotor') {
            sprite.play({ key: `level-kit:${segment.kind}`, startFrame: segment.phase ?? 0 })
          }
          return sprite
        }
        return this.addSprite(
          this.hazards,
          segment.x,
          segment.y,
          segment.width,
          segment.height,
          segment.kind,
          4,
        ).setData('hazardKind', segment.kind)
      case 'pad': {
        const pad = this.addKit(this.pickups, 'boost-pad', segment.x, segment.y, segment.width, segment.height)
        pad.setData('itemId', 'speed-pad')
        // Contact strip follows the visible plate, not the empty square above it.
        const body = pad.body as Phaser.Physics.Arcade.StaticBody
        body.setSize(segment.width * .88, segment.height * .22)
        body.setOffset(segment.width * .06, segment.height * .72)
        return pad
      }
      case 'pickup':
        if (segment.itemId.endsWith('-orb')) {
          const orb = this.addKit(this.pickups, segment.itemId as LevelKitId, segment.x, segment.y, 44, 44).setData('itemId', segment.itemId)
          ;(orb.body as Phaser.Physics.Arcade.StaticBody).setCircle(14, 0, 0).setOffset(8, 8)
          return orb
        }
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
    if (this.theme === 'crystal-aqueduct') tile.setTint(0xb4fff3)
    if (this.theme === 'ember-foundry') tile.setTint(0xffbe9d)
    this.scene.physics.add.existing(tile, true)
    ;(tile.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
    group.add(tile)
    return tile
  }

  private addKit(group: Phaser.Physics.Arcade.StaticGroup, id: LevelKitId, x: number, y: number, width: number, height: number): Phaser.GameObjects.Sprite {
    const sprite = addLevelKitSprite(this.scene, id, x, y)
    sprite.setOrigin(0).setDisplaySize(width, height).setDepth(4)
    this.scene.physics.add.existing(sprite, true)
    ;(sprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject()
    group.add(sprite)
    return sprite
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
