import Phaser from 'phaser'
import { playSfx, type Sfx } from '../audio/sfx'
import {
  DESPAWN_MARGIN,
  GAME_HEIGHT,
  KILL_Y,
  LOOKAHEAD,
  PLAYER_START_X,
  GROUND_Y,
  SCENE,
} from '../constants'
import { getItem } from '../data/items'
import { getLevel, levels, worldWidth } from '../data/levels'
import { Player } from '../entities/Player'
import { ensureTextures } from '../graphics/textures'
import { SpaceBackdrop } from '../graphics/SpaceBackdrop'
import { FinishGate } from '../graphics/FinishGate'
import { PowerupController } from '../items/PowerupController'
import { runSpeed } from '../run/speed'
import type { HudState } from '../types'
import { AuthoredSegmentSource } from '../world/SegmentSource'
import { WorldSpawner } from '../world/WorldSpawner'

type RunState = 'playing' | 'dead' | 'complete'

export class GameScene extends Phaser.Scene {
  private levelIndex = 0
  private state: RunState = 'playing'
  private elapsedMs = 0
  private distancePoints = 0
  private bankedScore = 0
  private lastX = PLAYER_START_X
  private score = 0
  private player!: Player
  private powerups = new PowerupController()
  private spawner!: WorldSpawner
  private backdrop!: SpaceBackdrop

  constructor() {
    super(SCENE.game)
  }

  init(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? 0
    this.state = 'playing'
    this.elapsedMs = 0
    this.distancePoints = 0
    this.bankedScore = 0
    this.lastX = PLAYER_START_X
    this.score = 0
    this.powerups = new PowerupController()
  }

  create(): void {
    ensureTextures(this)
    const level = getLevel(this.levelIndex)
    this.backdrop = new SpaceBackdrop(this)

    const platforms = this.physics.add.staticGroup()
    const hazards = this.physics.add.staticGroup()
    const pickups = this.physics.add.staticGroup()
    const finish = this.physics.add.staticGroup()

    this.player = new Player(this, PLAYER_START_X, GROUND_Y)
    this.spawner = new WorldSpawner(
      this,
      new AuthoredSegmentSource(level.segments),
      platforms,
      hazards,
      pickups,
      finish,
    )
    this.spawner.update(this.player.x + LOOKAHEAD, -1000)

    this.physics.add.collider(this.player, platforms, undefined, this.landFromAbove, this)
    this.physics.add.overlap(this.player, hazards, this.onHazard, undefined, this)
    this.physics.add.overlap(this.player, pickups, this.onPickup, undefined, this)
    this.physics.add.overlap(this.player, finish, this.onFinish, undefined, this)

    this.cameras.main.startFollow(this.player, false, 1, 0, -250, 0)
    this.cameras.main.setBounds(0, 0, worldWidth(level), GAME_HEIGHT)
    this.scene.launch(SCENE.hud)
  }

  update(_time: number, delta: number): void {
    this.backdrop.update(_time, this.cameras.main.scrollX)
    if (this.state !== 'playing') return

    const dt = Math.min(delta, 50)
    this.elapsedMs += dt
    const boosted = this.powerups.modifiers.jumpMultiplier > 1
    this.powerups.update(dt)
    if (boosted && this.powerups.modifiers.jumpMultiplier <= 1) playSfx(this, 'boostExpiry')

    const level = getLevel(this.levelIndex)
    const speed = runSpeed(
      this.elapsedMs / 1000,
      level,
      this.powerups.modifiers.speedMultiplier,
    )
    this.player.tick(dt, speed, this.powerups.modifiers.jumpMultiplier)
    this.spawner.update(
      this.player.x + LOOKAHEAD,
      this.cameras.main.scrollX - DESPAWN_MARGIN,
    )

    const moved = Math.max(0, this.player.x - this.lastX)
    this.distancePoints += (moved / 10) * this.powerups.modifiers.scoreMultiplier
    this.lastX = this.player.x
    this.score = Math.floor(this.distancePoints + this.bankedScore)

    if (this.player.y > KILL_Y) {
      this.fail()
      return
    }

    this.emitHud(speed)
  }

  private emitHud(speed: number): void {
    const level = getLevel(this.levelIndex)
    const state: HudState = {
      score: this.score,
      levelName: level.name,
      levelIndex: this.levelIndex,
      levelCount: levels.length,
      speed,
      jumpsRemaining: this.player.jumpsRemaining,
      effects: this.powerups.activeEffects,
    }
    this.events.emit('hud', state)
  }

  // Feet only catch a surface when they were above it last step, so gap lips don't snag a fall.
  private landFromAbove: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, surface) => {
    if (!surface || !('body' in surface) || !surface.body) return false
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const ground = surface.body as Phaser.Physics.Arcade.StaticBody
    const previousBottom = body.prev.y + body.height
    return body.velocity.y >= 0 && previousBottom <= ground.top + 10
  }

  private onHazard: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, hazard) => {
    if (this.state !== 'playing') return
    if (!(hazard instanceof Phaser.GameObjects.Sprite)) return
    if (this.powerups.tryAbsorbHit()) {
      hazard.destroy()
      this.player.flash()
      return
    }
    this.fail(hazard.texture.key === 'spike' ? 'spike' : 'reactor')
  }

  private onPickup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, pickup) => {
    if (this.state !== 'playing') return
    if (!(pickup instanceof Phaser.GameObjects.Sprite)) return
    if (pickup.getData('taken')) return
    const itemId = pickup.getData('itemId') as string
    playSfx(this, itemId === 'coin' ? 'coin' : 'boost')
    pickup.setData('taken', true)
    pickup.destroy()
    this.powerups.collect(getItem(itemId), (amount) => {
      this.bankedScore += amount
    })
  }

  private onFinish: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, marker) => {
    if (this.state !== 'playing') return
    if (marker instanceof Phaser.GameObjects.Sprite) {
      const gate = marker.getData('finishGate') as FinishGate | undefined
      gate?.celebrate()
    }
    this.win()
  }

  private fail(sound: Sfx = 'fall'): void {
    if (this.state !== 'playing') return
    this.state = 'dead'
    playSfx(this, sound)
    this.player.tumble()
    this.time.delayedCall(460, () => {
      this.scene.stop(SCENE.hud)
      this.scene.launch(SCENE.over, { score: this.score, levelIndex: this.levelIndex })
      this.scene.pause()
    })
  }

  private win(): void {
    if (this.state !== 'playing') return
    this.state = 'complete'
    playSfx(this, 'finish')
    this.player.halt()
    this.time.delayedCall(1100, () => {
      this.scene.stop(SCENE.hud)
      this.scene.launch(SCENE.complete, {
        score: this.score,
        levelIndex: this.levelIndex,
        levelName: getLevel(this.levelIndex).name,
      })
      this.scene.pause()
    })
  }
}
