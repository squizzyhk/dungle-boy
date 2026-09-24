import type Phaser from 'phaser'

export const MENU_THEME = 'music-dungle-boy-theme'
const states = new WeakMap<object, { wanted: boolean; muted: boolean; waiting: boolean; owner?: Phaser.Scene }>()

function stateFor(scene: Phaser.Scene) {
  let state = states.get(scene.sound)
  if (!state) { state = { wanted: false, muted: false, waiting: false }; states.set(scene.sound, state) }
  return state
}

export function preloadMusic(scene: Phaser.Scene): void {
  if (!scene.cache.audio.exists(MENU_THEME)) scene.load.audio(MENU_THEME, '/assets/audio/music/dungle-boy-theme.mp3')
}

function syncMusic(scene: Phaser.Scene): void {
  const state = stateFor(scene)
  const existing = scene.sound.get(MENU_THEME)
  if (!state.wanted || state.muted) {
    if (existing?.isPlaying) existing.pause()
    return
  }
  if (!scene.cache.audio.exists(MENU_THEME)) return
  if (scene.sound.locked) {
    if (!state.waiting) {
      state.waiting = true
      scene.sound.once('unlocked', () => {
        state.waiting = false
        // Re-check intent: the first gesture may already have started a level.
        syncMusic(scene)
      })
    }
    return
  }
  const music = existing ?? scene.sound.add(MENU_THEME, { loop: true, volume: .45 })
  if (music.isPaused) music.resume()
  else if (!music.isPlaying) music.play()
}

/** A single shared track resumes across menus; it never layers copies. */
export function enterMenuMusic(scene: Phaser.Scene): void {
  const state = stateFor(scene)
  state.owner = scene
  state.wanted = true
  syncMusic(scene)
  scene.events.once('shutdown', () => {
    if (state.owner === scene) leaveMenuMusic(scene)
  })
}

export function leaveMenuMusic(scene: Phaser.Scene): void {
  const state = stateFor(scene)
  state.owner = undefined
  state.wanted = false
  syncMusic(scene)
}

export function addMusicControl(scene: Phaser.Scene): void {
  const state = stateFor(scene)
  const control = scene.add.text(936, 20, '', { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#d6fff5', backgroundColor: '#18253c', padding: { x: 10, y: 8 } })
    .setOrigin(1, 0).setDepth(100).setInteractive({ useHandCursor: true })
  const refresh = () => control.setText(state.muted ? 'MUSIC: OFF' : scene.sound.locked ? 'MUSIC: TAP TO PLAY' : 'MUSIC: ON')
  control.on('pointerdown', () => {
    // An unlocking gesture should enable music, not immediately mute it.
    state.muted = scene.sound.locked ? false : !state.muted
    syncMusic(scene)
    refresh()
  })
  scene.sound.on('unlocked', refresh)
  scene.events.once('shutdown', () => scene.sound.off('unlocked', refresh))
  refresh()
}
