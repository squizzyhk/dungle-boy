export const JUMP = {
  coyoteMs: 120,
  bufferMs: 140,
  firstVelocity: -560,
  doubleVelocity: -500,
  cutMultiplier: 0.45,
} as const

export type JumpEvent = 'none' | 'first' | 'double'

export type JumpInput = {
  dtMs: number
  grounded: boolean
  jumpPressed: boolean
  jumpReleased: boolean
  velocityY: number
}

export type JumpResult = {
  event: JumpEvent
  velocityY?: number
}

export class JumpController {
  jumpsRemaining = 2
  private coyoteMs: number = JUMP.coyoteMs
  private bufferMs = 0
  private firstJumpRising = false

  step(input: JumpInput): JumpResult {
    let event: JumpEvent = 'none'
    let velocityY: number | undefined

    if (input.grounded) {
      this.jumpsRemaining = 2
      this.coyoteMs = JUMP.coyoteMs
      this.firstJumpRising = false
    }

    if (input.jumpPressed) {
      this.bufferMs = JUMP.bufferMs
    }

    const canFirst =
      input.grounded || (this.coyoteMs > 0 && this.jumpsRemaining === 2)
    const canDouble = !input.grounded && !canFirst && this.jumpsRemaining > 0

    if (this.bufferMs > 0 && canFirst) {
      velocityY = JUMP.firstVelocity
      this.jumpsRemaining = 1
      this.coyoteMs = 0
      this.bufferMs = 0
      this.firstJumpRising = true
      event = 'first'
    } else if (this.bufferMs > 0 && canDouble) {
      velocityY = JUMP.doubleVelocity
      this.jumpsRemaining = 0
      this.bufferMs = 0
      this.firstJumpRising = false
      event = 'double'
    } else if (input.jumpReleased && this.firstJumpRising && input.velocityY < 0) {
      velocityY = input.velocityY * JUMP.cutMultiplier
      this.firstJumpRising = false
    }

    if (!input.grounded && event !== 'first') {
      this.coyoteMs = Math.max(0, this.coyoteMs - input.dtMs)
      if (this.coyoteMs <= 0 && this.jumpsRemaining === 2) {
        this.jumpsRemaining = 1
      }
    }

    if (event === 'none') {
      this.bufferMs = Math.max(0, this.bufferMs - input.dtMs)
    }

    if ((velocityY ?? input.velocityY) >= 0) {
      this.firstJumpRising = false
    }

    return velocityY === undefined ? { event } : { event, velocityY }
  }
}
