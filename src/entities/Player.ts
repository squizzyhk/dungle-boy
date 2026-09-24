import Phaser from 'phaser'
import { playSfx } from '../audio/sfx'
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../constants'
import { JumpController } from './JumpController'
import { MallowMotion } from './MallowMotion'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly drawnScale = 0.6
  private readonly jumps = new JumpController()
  private readonly motion = new MallowMotion()
  private readonly visual: Phaser.GameObjects.Sprite
  private readonly effects = new Set<Phaser.GameObjects.Ellipse>()
  private readonly space: Phaser.Input.Keyboard.Key
  private readonly up: Phaser.Input.Keyboard.Key
  private readonly wKey: Phaser.Input.Keyboard.Key
  private wasGrounded = true
  private jumpWasDown = false
  private fallSpeed = 0
  private motionGrounded = true
  private motionSpeed = 0
  private tumbling = false
  private halted = false
  private stepHalf: number | undefined
  private flashTimer?: Phaser.Time.TimerEvent

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

    this.visual = scene.add.sprite(x, y, 'mallow', 0).setOrigin(0.5, 178 / 192).setDepth(11)
    this.visual.setScale(Player.drawnScale)
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this)
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.flashTimer?.remove(false)
      scene.tweens.killTweensOf(this.visual)
      this.visual.destroy()
      for (const effect of this.effects) {
        scene.tweens.killTweensOf(effect)
        effect.destroy()
      }
      this.effects.clear()
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
    this.trackGroundContact(grounded, body.velocity.y)
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
      const double = result.event === 'double'
      playSfx(this.scene, double ? 'doubleJump' : 'jump')
      this.motion.jump(double)
      this.puff(double ? 0.75 : 0.35, double)
      this.fallSpeed = 0
    } else if (result.velocityY !== undefined) {
      body.setVelocityY(result.velocityY)
    }

    body.setVelocityX(speed)
    this.motionSpeed = speed
    this.motionGrounded = grounded && result.event === 'none'
    this.wasGrounded = this.motionGrounded
  }

  tumble(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(60, -240)
    this.tumbling = true
    this.motion.jump(true)
    this.scene.tweens.killTweensOf(this.visual)
    this.scene.tweens.add({
      targets: this.visual,
      angle: 200,
      duration: 480,
    })
  }

  halt(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    // The finish can be touched in mid-air. Stop running, then land naturally.
    body.setVelocityX(0)
    this.halted = true
    this.motionSpeed = 0
  }

  flash(): void {
    this.visual.setTint(0xb9fff2)
    this.flashTimer?.remove(false)
    this.flashTimer = this.scene.time.delayedCall(180, () => this.visual.clearTint())
  }

  private syncVisual(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    // GameScene stops calling tick during the celebration, but physics continues.
    if (this.halted) {
      this.motionGrounded = body.blocked.down || body.touching.down
      this.trackGroundContact(this.motionGrounded, body.velocity.y)
      this.wasGrounded = this.motionGrounded
    }
    const pose = this.motion.update(delta, {
      grounded: !this.tumbling && this.motionGrounded,
      velocityY: body.velocity.y,
      speed: this.motionSpeed,
    })
    this.visual.setPosition(this.x, this.y - pose.lift)
    if (!this.tumbling && !this.halted && this.motionGrounded && this.motionSpeed > 5 && pose.texture === 'mallow-run') {
      const half = Math.floor(pose.frame / 12)
      if (this.stepHalf !== undefined && half !== this.stepHalf) playSfx(this.scene, 'footstep')
      this.stepHalf = half
    } else {
      this.stepHalf = undefined
    }
    this.visual.setTexture(this.tumbling ? 'mallow' : pose.texture, this.tumbling ? 10 : pose.frame)
    this.visual.setScale(Player.drawnScale * pose.scaleX, Player.drawnScale * pose.scaleY)
    if (!this.tumbling) this.visual.setAngle(pose.angle)
  }

  private trackGroundContact(grounded: boolean, velocityY: number): void {
    // Arcade clears downward velocity on contact; retain the preceding air speed.
    if (!grounded) this.fallSpeed = Math.max(this.fallSpeed, velocityY)
    if (grounded && !this.wasGrounded) {
      if (this.fallSpeed > 80) playSfx(this.scene, 'landing', Math.max(0.35, Math.min(1, this.fallSpeed / 780)))
      this.motion.land(this.fallSpeed)
      this.puff(Math.min(1, this.fallSpeed / 780), false)
      this.fallSpeed = 0
    }
  }

  private puff(strength: number, airborne: boolean): void {
    const count = airborne ? 6 : 5
    for (let i = 0; i < count; i += 1) {
      const side = i % 2 === 0 ? -1 : 1
      const spread = 12 + i * 3.5 + strength * 15
      const mote = this.scene.add.ellipse(
        this.x + side * (5 + i),
        this.y - (airborne ? 16 : 1),
        4 + strength * 4,
        2 + strength * 2,
        airborne ? 0xb9fff6 : 0xe1ddff,
        0.62,
      ).setDepth(10)
      this.effects.add(mote)
      this.scene.tweens.add({
        targets: mote,
        x: mote.x + side * spread,
        y: mote.y - 3 - i * 1.8,
        scaleX: 1.7,
        scaleY: 1.3,
        alpha: 0,
        duration: 230 + i * 22,
        ease: 'Cubic.out',
        onComplete: () => {
          this.effects.delete(mote)
          mote.destroy()
        },
      })
    }
    if (airborne) {
      const ring = this.scene.add.ellipse(this.x, this.y - 14, 22, 10)
        .setStrokeStyle(2, 0xc8fff5, 0.6).setDepth(10)
      this.effects.add(ring)
      this.scene.tweens.add({
        targets: ring,
        scaleX: 2.4,
        scaleY: 1.5,
        alpha: 0,
        duration: 260,
        ease: 'Quad.out',
        onComplete: () => {
          this.effects.delete(ring)
          ring.destroy()
        },
      })
    }
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

