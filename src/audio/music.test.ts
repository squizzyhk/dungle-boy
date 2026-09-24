import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { enterMenuMusic, leaveMenuMusic, MENU_THEME } from './music'

function fixture(locked = false) {
  const track = {
    isPlaying: false, isPaused: false,
    play: vi.fn(() => { track.isPlaying = true; track.isPaused = false }),
    pause: vi.fn(() => { track.isPlaying = false; track.isPaused = true }),
    resume: vi.fn(() => { track.isPlaying = true; track.isPaused = false }),
  }
  let added = false
  const sound = Object.assign(new EventEmitter(), {
    locked,
    get: vi.fn(() => added ? track : null),
    add: vi.fn(() => { added = true; return track }),
  })
  const scene = { sound, cache: { audio: { exists: () => true } }, events: new EventEmitter() }
  return { scene: scene as unknown as Phaser.Scene, sound, track }
}

describe('menu theme lifecycle', () => {
  it('loops one instance and resumes it on returning to menus', () => {
    const { scene, sound, track } = fixture()
    enterMenuMusic(scene)
    expect(sound.add).toHaveBeenCalledWith(MENU_THEME, { loop: true, volume: .45 })
    enterMenuMusic(scene)
    expect(track.play).toHaveBeenCalledTimes(1)
    leaveMenuMusic(scene)
    expect(track.isPlaying).toBe(false)
    enterMenuMusic(scene)
    expect(track.resume).toHaveBeenCalledTimes(1)
    expect(sound.add).toHaveBeenCalledTimes(1)
  })

  it('never starts delayed menu audio after the unlocking click starts gameplay', () => {
    const { scene, sound, track } = fixture(true)
    enterMenuMusic(scene)
    enterMenuMusic(scene)
    expect(sound.listenerCount('unlocked')).toBe(1)
    leaveMenuMusic(scene)
    sound.locked = false
    sound.emit('unlocked')
    expect(track.play).not.toHaveBeenCalled()
    expect(sound.add).not.toHaveBeenCalled()
  })

  it('starts after audio unlock when still in a menu and pauses on shutdown', () => {
    const { scene, sound, track } = fixture(true)
    enterMenuMusic(scene)
    sound.locked = false
    sound.emit('unlocked')
    expect(track.isPlaying).toBe(true)
    scene.events.emit('shutdown')
    expect(track.isPlaying).toBe(false)
  })

  it('does not let an older menu shutdown stop the next menu', () => {
    const { scene, track } = fixture()
    const next = { ...scene, events: new EventEmitter() } as unknown as Phaser.Scene
    enterMenuMusic(scene)
    enterMenuMusic(next)
    scene.events.emit('shutdown')
    expect(track.isPlaying).toBe(true)
    next.events.emit('shutdown')
    expect(track.isPlaying).toBe(false)
  })
})
