import type Phaser from 'phaser'
import { assetUrl } from '../assetUrl'

export const MENU_THEME = 'music-dungle-boy-theme'
export const MENU_PLAYLIST = [
  { key: MENU_THEME, path: 'assets/audio/music/dungle-boy-theme.mp3' },
  { key: 'music-dungle-boy-theme-2', path: 'assets/audio/music/dungle-boy-theme-2.mp3' },
  { key: 'music-dungle-boy-theme-3', path: 'assets/audio/music/dungle-boy-theme-3.mp3' },
  { key: 'music-dungle-boy-theme-4', path: 'assets/audio/music/dungle-boy-theme-4.mp3' },
] as const

const states = new WeakMap<object, { wanted: boolean; muted: boolean; waiting: boolean; index: number; owner?: Phaser.Scene }>()

function stateFor(scene: Phaser.Scene) {
  let state = states.get(scene.sound)
  if (!state) { state = { wanted: false, muted: false, waiting: false, index: 0 }; states.set(scene.sound, state) }
  return state
}

export function preloadMusic(scene: Phaser.Scene): void {
  for (const track of MENU_PLAYLIST) {
    if (!scene.cache.audio.exists(track.key)) scene.load.audio(track.key, assetUrl(track.path))
  }
}

function syncMusic(scene: Phaser.Scene): void {
  const state = stateFor(scene)
  const track = MENU_PLAYLIST[state.index]
  const existing = scene.sound.get(track.key)
  if (!state.wanted || state.muted) {
    if (existing?.isPlaying) existing.pause()
    return
  }
  if (!scene.cache.audio.exists(track.key)) return
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
  const music = existing ?? scene.sound.add(track.key, { loop: false, volume: .45 })
  if (music.isPaused) music.resume()
  else if (!music.isPlaying) {
    const finishingIndex = state.index
    music.once('complete', () => {
      if (state.index !== finishingIndex) return
      state.index = (state.index + 1) % MENU_PLAYLIST.length
      syncMusic(state.owner ?? scene)
    })
    music.play()
  }
}

/** One shared playlist resumes across menus; tracks never layer copies. */
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
