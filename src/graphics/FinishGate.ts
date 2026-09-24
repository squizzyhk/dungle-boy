import Phaser from 'phaser'

/** A physical mast and a soft, billowing hologram. Its artwork never defines collision. */
export class FinishGate extends Phaser.GameObjects.Container {
  private readonly hologram: Phaser.GameObjects.Graphics
  private readonly beacon: Phaser.GameObjects.Graphics
  private readonly label: Phaser.GameObjects.Text
  private elapsed = 0
  private completed = false

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super(scene, x, groundY)
    scene.add.existing(this)
    this.setDepth(6).setSize(194, 236)

    const metal = scene.add.graphics()
    this.add(metal)

    // Grounding shadow, layered plinth, and angled outriggers give the pole some weight.
    metal.fillStyle(0x151338, 0.34).fillEllipse(20, -1, 107, 18)
    metal.fillStyle(0x33eaff, 0.07).fillEllipse(20, -4, 150, 32)
    metal.fillStyle(0x181b36).fillPoints([
      new Phaser.Math.Vector2(-26, -2), new Phaser.Math.Vector2(-17, -15), new Phaser.Math.Vector2(3, -22),
      new Phaser.Math.Vector2(37, -22), new Phaser.Math.Vector2(57, -13), new Phaser.Math.Vector2(66, -2),
    ], true)
    metal.fillStyle(0x667b9e).fillPoints([
      new Phaser.Math.Vector2(-17, -15), new Phaser.Math.Vector2(3, -22),
      new Phaser.Math.Vector2(37, -22), new Phaser.Math.Vector2(57, -13),
      new Phaser.Math.Vector2(41, -9), new Phaser.Math.Vector2(-4, -9),
    ], true)
    metal.lineStyle(2, 0xa6e9ef, 0.85).lineBetween(-17, -15, 1, -21)
    metal.lineBetween(39, -21, 56, -13)
    metal.fillStyle(0x32f5e3).fillRoundedRect(-13, -8, 22, 3, 1)
    metal.fillStyle(0xfc9bbc).fillRoundedRect(31, -8, 22, 3, 1)
    metal.fillStyle(0x21243d).fillRoundedRect(7, -45, 25, 36, 5)
    metal.fillStyle(0x758ba9).fillRoundedRect(11, -46, 17, 35, 3)
    metal.fillStyle(0x293750).fillRect(19, -42, 9, 31)
    metal.lineStyle(2, 0xb5cddd).lineBetween(11, -41, 11, -16)

    // A slender telescoping mast, clearly distinct from the pennant it supports.
    metal.fillStyle(0x16223b).fillRoundedRect(13, -208, 13, 173, 4)
    metal.fillStyle(0x7794ae).fillRoundedRect(15, -207, 7, 171, 3)
    metal.fillStyle(0xc9e6eb).fillRect(15, -200, 2, 155)
    metal.fillStyle(0x45ede0, 0.85).fillRect(23, -200, 2, 150)
    for (const y of [-187, -123, -61]) {
      metal.fillStyle(0x25364f).fillRoundedRect(10, y, 18, 7, 2)
      metal.fillStyle(0x9ad4e0).fillRect(12, y, 12, 2)
    }
    metal.fillStyle(0x26354e).fillRoundedRect(8, -215, 23, 12, 4)
    metal.lineStyle(2, 0x7fe8ef).lineBetween(19, -216, 19, -229)
    metal.fillStyle(0xf8c9e0).fillCircle(19, -230, 3)

    // Direction stripes and runway dots announce the endpoint on the approach.
    for (let i = 0; i < 4; i += 1) {
      const dotX = -99 + i * 22
      metal.fillStyle(0x41f6de, 0.15 + i * 0.12).fillEllipse(dotX, -2, 12, 3)
    }
    metal.lineStyle(2, 0x8ff8ee, 0.6)
    for (let i = 0; i < 2; i += 1) {
      metal.beginPath().moveTo(-48 + i * 13, -32).lineTo(-42 + i * 13, -26)
        .lineTo(-48 + i * 13, -20).strokePath()
    }

    this.hologram = scene.add.graphics()
    this.beacon = scene.add.graphics()
    this.label = scene.add.text(77, -159, 'FINISH', {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold',
      color: '#f6ffff', letterSpacing: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#80fff1', blur: 8, fill: true },
    }).setOrigin(0.5)
    this.add([this.hologram, this.label, this.beacon])
    this.paint()
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.tick, this)
  }

  celebrate(): void {
    this.completed = true
    this.label.setText('CLEAR!')
  }

  private tick(_time: number, delta: number): void {
    this.elapsed += Math.min(delta, 50) / 1000
    this.paint()
  }

  private wave(x: number): number {
    // The attachment stays still; the loose tip has the most movement.
    return Math.sin(x * 0.055 - this.elapsed * 4.1) * 5.3 * (x / 129)
      + Math.sin(x * 0.023 - this.elapsed * 2.4) * 2 * (x / 129)
  }

  private paint(): void {
    const flag = this.hologram.clear()
    const x0 = 26
    const y0 = -187
    const width = 129
    const height = 55
    const top: Phaser.Math.Vector2[] = []
    const lower: Phaser.Math.Vector2[] = []

    for (let i = 0; i <= 20; i += 1) {
      const x = width * i / 20
      top.push(new Phaser.Math.Vector2(x0 + x, y0 + this.wave(x)))
      lower.push(new Phaser.Math.Vector2(x0 + x, y0 + height + this.wave(x + 9)))
    }
    // A dark translucent interior preserves the lettering against a detailed sky.
    flag.fillStyle(0x102e52, 0.77).fillPoints([...top, ...lower.slice().reverse()], true)
    for (let i = 0; i < 20; i += 1) {
      const shimmer = 0.1 + (Math.sin(i * 0.47 - this.elapsed * 3.2) + 1) * 0.055
      flag.fillStyle(i > 14 ? 0xf29acc : 0x56f6ee, shimmer)
      flag.fillPoints([top[i], top[i + 1], lower[i + 1], lower[i]], true)
    }
    // Inset scan lines follow the same cloth wave instead of sliding over a rectangle.
    flag.lineStyle(1, 0x91f8fb, 0.14)
    for (let row = 1; row < 7; row += 1) {
      flag.beginPath()
      top.forEach((point, i) => {
        const y = point.y + height * row / 7
        if (i === 0) flag.moveTo(point.x, y)
        else flag.lineTo(point.x, y)
      })
      flag.strokePath()
    }
    flag.lineStyle(5, 0x42efeb, 0.08).strokePoints(top)
    flag.lineStyle(1.5, 0xa6fff9, 0.9).strokePoints(top)
    flag.lineStyle(1.5, 0x75dcec, 0.7).strokePoints(lower)
    // The split, luminous free end is recognizable as a flag even when still.
    const tip = top[top.length - 1]
    const bottom = lower[lower.length - 1]
    flag.fillStyle(0x96fbf6, 0.36).fillPoints([
      new Phaser.Math.Vector2(tip.x - 9, tip.y), new Phaser.Math.Vector2(tip.x + 11, tip.y + 1),
      new Phaser.Math.Vector2(tip.x + 1, (tip.y + bottom.y) / 2),
      new Phaser.Math.Vector2(tip.x + 11, bottom.y - 1), new Phaser.Math.Vector2(tip.x - 9, bottom.y),
    ], true)
    flag.lineStyle(1, 0xe7ffff, 0.75).lineBetween(x0, y0 + 2, x0, y0 + height - 2)
    this.label.y = -159 + this.wave(57) * 0.5
    this.label.rotation = Math.sin(this.elapsed * 3.2) * 0.012

    const orb = this.beacon.clear()
    const pulse = (Math.sin(this.elapsed * 3.1) + 1) / 2
    orb.fillStyle(0x5dffed, 0.025 + pulse * 0.02).fillCircle(19, -216, 34)
    orb.fillStyle(0x6affee, 0.08).fillCircle(19, -216, 20)
    orb.lineStyle(1.5, 0xa28ff9, 0.6).strokeEllipse(19, -216, 49, 15)
    orb.lineStyle(1, 0x76ffe8, 0.38).strokeEllipse(19, -216, 33, 25)
    orb.fillStyle(0x39bfc9).fillCircle(19, -216, 7)
    orb.fillStyle(0xbbfff4).fillCircle(17, -218, 5)
    orb.fillStyle(0xffffff).fillCircle(15, -220, 2)
    const orbit = this.elapsed * 2.1
    orb.fillStyle(0xffbae7).fillCircle(19 + Math.cos(orbit) * 24.5, -216 + Math.sin(orbit) * 7.5, 2.5)
    orb.fillStyle(0x62ffee).fillCircle(19, -31, 3 + pulse * 0.6)
    if (this.completed) {
      for (let i = 0; i < 12; i += 1) {
        const t = (this.elapsed * 0.65 + i / 12) % 1
        const x = 18 + Math.sin(i * 4.3) * (20 + t * 68)
        const y = -25 - t * 175
        orb.fillStyle(i % 2 ? 0xffc0e9 : 0xb3fff0, 1 - t)
          .fillCircle(x, y, 1.5 + (1 - t) * 2)
      }
    }
  }

  destroy(fromScene?: boolean): void {
    this.scene?.events.off(Phaser.Scenes.Events.UPDATE, this.tick, this)
    super.destroy(fromScene)
  }
}
