import { describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { playSfx } from './sfx'

function fixture() {
  const values=new Map<string,unknown>()
  const scene={
    cache:{audio:{exists:vi.fn(()=>true)}},
    sound:{locked:false,play:vi.fn(()=>true),once:vi.fn()},
    game:{registry:{get:(k:string)=>values.get(k),set:(k:string,v:unknown)=>values.set(k,v)},events:{emit:vi.fn()}},
  }
  return {scene, target:scene as unknown as Phaser.Scene}
}
describe('SFX playback safeguards',()=>{
  it('does not queue gameplay events behind an audio lock',()=>{
    const {scene,target}=fixture(); scene.sound.locked=true
    playSfx(target,'footstep'); playSfx(target,'jump')
    expect(scene.sound.play).not.toHaveBeenCalled()
    expect(scene.sound.once).not.toHaveBeenCalled()
  })
  it('retains only one initiating click and plays after unlock',()=>{
    const {scene,target}=fixture(); scene.sound.locked=true
    playSfx(target,'button'); playSfx(target,'button')
    expect(scene.sound.once).toHaveBeenCalledTimes(1)
    scene.sound.locked=false
    scene.sound.once.mock.calls[0][1]()
    expect(scene.sound.play).toHaveBeenCalledTimes(1)
    expect(scene.sound.play).toHaveBeenCalledWith('sfx-button',{volume:0.65})
  })
  it('skips unavailable audio instead of throwing during scene setup',()=>{
    const {scene,target}=fixture(); scene.cache.audio.exists.mockReturnValue(false)
    playSfx(target,'landing')
    expect(scene.sound.play).not.toHaveBeenCalled()
  })
  it('keeps landing volume bounded and footsteps quiet',()=>{
    const {scene,target}=fixture()
    playSfx(target,'landing',20); playSfx(target,'footstep')
    expect(scene.sound.play).toHaveBeenNthCalledWith(1,'sfx-landing',{volume:0.8})
    expect(scene.sound.play).toHaveBeenNthCalledWith(2,'sfx-footstep',{volume:0.22})
  })
})
