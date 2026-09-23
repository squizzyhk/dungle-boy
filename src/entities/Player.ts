import Phaser from 'phaser'
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../constants'
import { JumpController } from './JumpController'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly drawnScale = 1.55
  private readonly jumps = new JumpController()
  private readonly visual: Phaser.GameObjects.Image
  private readonly space: Phaser.Input.Keyboard.Key
  private readonly up: Phaser.Input.Keyboard.Key
  private readonly wKey: Phaser.Input.Keyboard.Key
  private wasGrounded = true
  private jumpWasDown = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setOrigin(0.5, 1)
    this.setVisible(false)
    this.setDepth(10)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(PLAYER_WIDTH, PLAYER_HEIGHT)
    body.setCollideWorldBounds(false)

    this.visual = scene.add.image(x, y, 'player').setOrigin(0.5, 1).setDepth(11)
    this.visual.setScale(Player.drawnScale)
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this)
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.visual.destroy()
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this)
    })

    const keyboard = scene.input.keyboard
    if (!keyboard) throw new Error('Keyboard input is unavailable')
    this.space = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.up = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    this.wKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.W,
    ])
    this.jumpWasDown = this.isJumpHeld()
  }

  get jumpsRemaining(): number {
    return this.jumps.jumpsRemaining
  }

  tick(dtMs: number, speed: number, jumpMultiplier: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    const grounded = body.blocked.down || body.touching.down
    const jump = this.readJump()
    const result = this.jumps.step({
      dtMs,
      grounded,
      jumpPressed: jump.pressed,
      jumpReleased: jump.released,
      velocityY: body.velocity.y,
    })

    if (result.event === 'first' || result.event === 'double') {
      body.setVelocityY((result.velocityY ?? 0) * jumpMultiplier)
      if (result.event === 'first') this.playStretch()
      else this.playPop()
    } else if (result.velocityY !== undefined) {
      body.setVelocityY(result.velocityY)
    }

    body.setVelocityX(speed)

    if (grounded && !this.wasGrounded) this.playSquash()
    this.wasGrounded = grounded
  }

  tumble(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(60, -240)
    this.scene.tweens.killTweensOf(this.visual)
    this.scene.tweens.add({
      targets: this.visual,
      angle: 200,
      duration: 480,
    })
  }

  halt(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.setAllowGravity(false)
  }

  flash(): void {
    this.visual.setTint(0xb9fff2)
    this.scene.time.delayedCall(180, () => this.visual.clearTint())
  }

  private syncVisual(): void {
    this.visual.setPosition(this.x, this.y)
  }

  private playStretch(): void {
    this.tweenVisual(0.82, 1.2)
  }

  private playPop(): void {
    this.tweenVisual(1.24, 1.24)
  }

  private playSquash(): void {
    this.tweenVisual(1.22, 0.76)
  }

  private tweenVisual(scaleX: number, scaleY: number): void {
    this.scene.tweens.killTweensOf(this.visual)
    this.visual.setScale(Player.drawnScale)
    this.visual.setAngle(0)
    this.scene.tweens.add({
      targets: this.visual,
      scaleX: Player.drawnScale * scaleX,
      scaleY: Player.drawnScale * scaleY,
      duration: 80,
      yoyo: true,
      ease: 'Quad.out',
    })
  }

  private readJump(): { pressed: boolean; released: boolean } {
    const held = this.isJumpHeld()
    const pressed = held && !this.jumpWasDown
    const released = !held && this.jumpWasDown
    this.jumpWasDown = held
    return { pressed, released }
  }

  private isJumpHeld(): boolean {
    return (
      this.space.isDown ||
      this.up.isDown ||
      this.wKey.isDown ||
      this.scene.input.activePointer.primaryDown
    )
  }
}
