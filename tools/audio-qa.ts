import type Phaser from 'phaser'
import { MENU_THEME } from '../src/audio/music'
import { playSfx, sfxVolumes, type Sfx } from '../src/audio/sfx'

/** Visible development-only evidence of actual Phaser playback and decode. */
export function installAudioQA(game: Phaser.Game) {
  const panel=document.createElement('pre')
  panel.id='audio-status'
  document.body.append(panel)
  const counts: Record<string,number>={}
  game.events.on('sfx-played',(name:string)=>{counts[name]=(counts[name]??0)+1})
  game.events.on('poststep',()=>{
    const loaded=Object.keys(sfxVolumes).filter(name=>game.cache.audio.exists(`sfx-${name}`))
    const theme = game.sound.get(MENU_THEME)
    panel.textContent=`Audio decoded: ${loaded.length}/13 | locked: ${game.sound.locked}\nPlayback: ${JSON.stringify(counts)}\nMenu theme: ${game.cache.audio.exists(MENU_THEME) ? 'decoded' : 'loading'} | ${theme?.isPlaying ? 'playing' : theme?.isPaused ? 'paused' : 'stopped'} | instances: ${game.sound.getAll(MENU_THEME).length}`
  })
  const button=document.createElement('button')
  button.textContent='Audition all integrated sounds'
  document.querySelector('#controls')!.append(button)
  button.onclick=()=>{
    const scene=game.scene.getScenes(true)[0]
    Object.keys(sfxVolumes).forEach((name,i)=>setTimeout(()=>playSfx(scene,name as Sfx),100+i*1500))
  }
}
