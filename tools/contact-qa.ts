import Phaser from 'phaser'
import { touchesHazard } from '../src/world/HazardCollision'

/** Visible regression fixture using real Arcade broad phase and runtime mask filtering. */
export class ContactQA extends Phaser.Scene {
  constructor() { super('contact-qa') }
  create() {
    const cases = [
      { label: 'extended: empty corner', kind: 'retracting-spikes', frame: 3, p: [0,0,16,20], hit: false },
      { label: 'extended: actual tip', kind: 'retracting-spikes', frame: 3, p: [42,16,12,16], hit: true },
      { label: 'retracted: same spot', kind: 'retracting-spikes', frame: 0, p: [42,16,12,16], hit: false },
      { label: 'mounting socket', kind: 'retracting-spikes', frame: 3, p: [35,76,26,14], hit: false },
      { label: 'rotor: empty corner', kind: 'plasma-rotor', frame: 0, p: [0,0,8,8], hit: false },
      { label: 'rotor: solid hub', kind: 'plasma-rotor', frame: 0, p: [42,42,12,12], hit: true },
      { label: 'original spike: corner', kind: 'spike', frame: 0, p: [0,0,8,8], hit: false },
      { label: 'original spike: tip', kind: 'spike', frame: 0, p: [12,4,8,14], hit: true },
    ]
    const checks: { label: string; expected: boolean; hit: boolean; text: Phaser.GameObjects.Text }[] = []
    cases.forEach((c, i) => {
      const x = 48 + (i % 4) * 235, y = 90 + Math.floor(i / 4) * 220
      const texture = c.kind === 'spike' ? 'spike' : `level-kit:${c.kind}`
      const sprite = this.add.sprite(x, y, texture, c.kind === 'spike' ? undefined : c.frame).setOrigin(0).setDisplaySize(96, c.kind === 'spike' ? 48 : 96).setData('hazardKind', c.kind)
      this.physics.add.existing(sprite, true)
      const probe = this.add.rectangle(x+c.p[0], y+c.p[1], c.p[2], c.p[3], c.hit ? 0xffa99d : 0x9ffff0, .5).setOrigin(0)
      this.physics.add.existing(probe)
      const body = probe.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      const text = this.add.text(x-20, y+120, c.label, { fontSize:'13px',color:'#c6dce5' })
      const check = { label:c.label, expected:c.hit, hit:false, text }; checks.push(check)
      this.physics.add.overlap(probe, sprite, () => { check.hit = true }, () => touchesHazard(sprite, body))
    })
    this.time.delayedCall(150, () => {
      for (const c of checks) c.text.setText(`${c.hit === c.expected ? 'PASS' : 'FAIL'}: ${c.label}\n${c.hit ? 'contact detected' : 'no damage'}`)
      document.querySelector('#status')!.textContent = `Contact checks: ${checks.filter(c => c.hit === c.expected).length}/${checks.length} passed through Arcade overlap and the runtime mask filter.`
    })
  }
}
