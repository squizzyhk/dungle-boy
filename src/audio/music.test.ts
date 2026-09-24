import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { enterMenuMusic, leaveMenuMusic, MENU_PLAYLIST, MENU_THEME, preloadMusic } from './music'

function fixture(locked = false) {
  const tracks = new Map<string, EventEmitter & {
    isPlaying: boolean
    isPaused: boolean
    play: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    resume: ReturnType<typeof vi.fn>
  }>()
  const makeTrack = () => {
    const track = Object.assign(new EventEmitter(), {
      isPlaying: false, isPaused: false,
      play: vi.fn(() => { track.isPlaying = true; track.isPaused = false }),
      pause: vi.fn(() => { track.isPlaying = false; track.isPaused = true }),
      resume: vi.fn(() => { track.isPlaying = true; track.isPaused = false }),
    })
    return track
  }
  const sound = Object.assign(new EventEmitter(), {
    locked,
    get: vi.fn((key: string) => tracks.get(key) ?? null),
    add: vi.fn((key: string) => {
      const track = makeTrack()
      tracks.set(key, track)
      return track
    }),
  })
  const load = { audio: vi.fn() }
  const scene = { sound, load, cache: { audio: { exists: () => true } }, events: new EventEmitter() }
  return { scene: scene as unknown as Phaser.Scene, sound, tracks, load }
}

describe('menu theme lifecycle', () => {
  it('preloads all four themes in playlist order', () => {
    const { scene, load } = fixture()
    const exists = vi.spyOn(scene.cache.audio, 'exists').mockReturnValue(false)
    preloadMusic(scene)
    expect(exists).toHaveBeenCalledTimes(4)
    expect(load.audio.mock.calls.map(([key]) => key)).toEqual(MENU_PLAYLIST.map(track => track.key))
  })

  it('plays the four themes in order and returns to the original', () => {
    const { scene, sound, tracks } = fixture()
    enterMenuMusic(scene)
    for (const [index, playlistTrack] of MENU_PLAYLIST.entries()) {
      const track = tracks.get(playlistTrack.key)!
      expect(track.play).toHaveBeenCalledTimes(1)
      track.isPlaying = false
      track.emit('complete')
      expect(sound.add).toHaveBeenNthCalledWith(index + 1, playlistTrack.key, { loop: false, volume: .45 })
    }
    expect(tracks.get(MENU_THEME)!.play).toHaveBeenCalledTimes(2)
    expect(sound.add).toHaveBeenCalledTimes(4)
  })

  it('resumes the current track on returning to menus', () => {
    const { scene, sound, tracks } = fixture()
    enterMenuMusic(scene)
    const track = tracks.get(MENU_THEME)!
    expect(sound.add).toHaveBeenCalledWith(MENU_THEME, { loop: false, volume: .45 })
    enterMenuMusic(scene)
    expect(track.play).toHaveBeenCalledTimes(1)
    leaveMenuMusic(scene)
    expect(track.isPlaying).toBe(false)
    enterMenuMusic(scene)
    expect(track.resume).toHaveBeenCalledTimes(1)
    expect(sound.add).toHaveBeenCalledTimes(1)
  })

  it('never starts delayed menu audio after the unlocking click starts gameplay', () => {
    const { scene, sound, tracks } = fixture(true)
    enterMenuMusic(scene)
    enterMenuMusic(scene)
    expect(sound.listenerCount('unlocked')).toBe(1)
    leaveMenuMusic(scene)
    sound.locked = false
    sound.emit('unlocked')
    expect(tracks.size).toBe(0)
    expect(sound.add).not.toHaveBeenCalled()
  })

  it('starts after audio unlock when still in a menu and pauses on shutdown', () => {
    const { scene, sound, tracks } = fixture(true)
    enterMenuMusic(scene)
    sound.locked = false
    sound.emit('unlocked')
    const track = tracks.get(MENU_THEME)!
    expect(track.isPlaying).toBe(true)
    scene.events.emit('shutdown')
    expect(track.isPlaying).toBe(false)
  })

  it('does not let an older menu shutdown stop the next menu', () => {
    const { scene, tracks } = fixture()
    const next = { ...scene, events: new EventEmitter() } as unknown as Phaser.Scene
    enterMenuMusic(scene)
    const track = tracks.get(MENU_THEME)!
    enterMenuMusic(next)
    scene.events.emit('shutdown')
    expect(track.isPlaying).toBe(true)
    next.events.emit('shutdown')
    expect(track.isPlaying).toBe(false)
  })
})
