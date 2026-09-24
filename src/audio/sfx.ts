import type Phaser from 'phaser'

export const sfxVolumes = {
  jump: 0.8, doubleJump: 0.75, landing: 0.8, coin: 0.55,
  boost: 0.75, boostExpiry: 0.55, reactor: 0.85, spike: 0.8,
  fall: 0.8, finish: 0.8, button: 0.65, hover: 0.25, footstep: 0.22,
} as const
export type Sfx = keyof typeof sfxVolumes
const hoverTimes = new WeakMap<object, number>()

export function preloadSfx(scene: Phaser.Scene): void {
  for (const name of Object.keys(sfxVolumes)) {
    const key = `sfx-${name}`
    if (!scene.cache.audio.exists(key)) scene.load.audio(key, `/assets/audio/${name}.wav`)
  }
}

export function playSfx(scene: Phaser.Scene, name: Sfx, strength = 1): void {
  const key = `sfx-${name}`
  if (!scene.cache.audio.exists(key)) return
  // Only retain the initiating click while the browser unlocks audio. Never queue
  // footsteps or gameplay events to burst out later after an autoplay restriction.
  if (scene.sound.locked) {
    if (name === 'button' && scene.game.registry.get('sfx-unlock-click') !== true) {
      scene.game.registry.set('sfx-unlock-click', true)
      scene.sound.once('unlocked', () => {
        scene.game.registry.set('sfx-unlock-click', false)
        playSfx(scene, name, strength)
      })
    }
    return
  }
  if (name === 'hover') {
    const now = performance.now()
    if (now - (hoverTimes.get(scene.sound) ?? -Infinity) < 90) return
    hoverTimes.set(scene.sound, now)
  }
  const volume = sfxVolumes[name] * Math.max(0, Math.min(1, strength))
  if (scene.sound.play(key, { volume })) {
    scene.game.events.emit('sfx-played', name, volume)
  }
}

