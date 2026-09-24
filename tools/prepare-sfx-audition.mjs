import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

// Audition artifacts only. Nothing in this file changes or loads game audio.
const root = path.resolve('assets/sfx-audition')
const out = path.join(root, 'previews')
fs.mkdirSync(out, { recursive: true })
const D = 'digital-audio', I = 'interface-sounds', P = 'impact-sounds', S = 'sci-fi-sounds', J = 'music-jingles'
const choice = (label, pack, file) => ({ label, pack, file: `Audio/${file}.ogg` })
const groups = [
  ['01-jump', 'Jump', 'Player.tick: accepted first jump only', [choice('Pluck',I,'pluck_001'),choice('Phase jump',D,'phaseJump1'),choice('Slime spring',S,'slime_000')]],
  ['02-double-jump', 'Double jump', 'Player.tick: accepted double jump; distinct from first jump', [choice('High rise',D,'highUp'),choice('Phase burst',D,'phaseJump3'),choice('Maximize',I,'maximize_003')]],
  ['03-landing', 'Landing', 'Player.trackGroundContact: air-to-ground transition, volume scaled by fall speed', [choice('Soft impact',P,'impactSoft_medium_000'),choice('Light impact',P,'impactGeneric_light_000'),choice('Light deck impact',P,'impactPlate_light_000')]],
  ['04-coin', 'Coin pickup', 'GameScene.onPickup: coin only, once per item', [choice('Glass chime',I,'glass_001'),choice('Two-tone',D,'twoTone1'),choice('Pep blip',D,'pepSound1')]],
  ['05-boost', 'Jump boost acquired', 'GameScene.onPickup: jump-boost; five-second effect', [choice('Power-up 1',D,'powerUp1'),choice('Power-up 6',D,'powerUp6'),choice('Confirmation',I,'confirmation_002')]],
  ['06-boost-expiry', 'Jump boost expires', 'PowerupController.update: final active jump boost expires; avoid false cues for overlapping boosts', [choice('High down',D,'highDown'),choice('Minimize',I,'minimize_003'),choice('Low down',D,'lowDown')]],
  ['07-reactor-hit', 'Reactor collision', 'GameScene.onHazard: crate texture; one lethal impact, no duplicate game-over sting', [choice('Soft heavy bump',P,'impactSoft_heavy_000'),choice('Metal bump',P,'impactMetal_medium_000'),choice('Punch impact',P,'impactPunch_medium_000')]],
  ['08-plasma-hit', 'Plasma collision', 'GameScene.onHazard: spike texture; one lethal zap', [choice('Zap',D,'zap1'),choice('Force field',S,'forceField_000'),choice('Alternate zap',D,'zap2')]],
  ['09-fall', 'Fall into a gap', 'GameScene.fail: distinguish KILL_Y from hazard death; do not play for a recoverable descent', [choice('Phaser descent',D,'phaserDown1'),choice('Three-tone descent',D,'zapThreeToneDown'),choice('Low tumble',D,'lowRandom')]],
  ['10-finish', 'Finish celebration', 'GameScene.win / FinishGate.celebrate: once at crossing; audio survives results overlay', [choice('Pizzicato jingle',J,'Pizzicato jingles/jingles_PIZZI00'),choice('Steel jingle',J,'Steel jingles/jingles_STEEL00'),choice('Compact confirmation',I,'confirmation_004')]],
  ['11-buttons', 'Button press', 'addButton pointerdown: level select, retry, next, menu; shared sound', [choice('Click',I,'click_001'),choice('Select',I,'select_002'),choice('Switch',I,'switch_003')]],
  ['12-hover', 'Button hover (optional)', 'addButton pointerover: mouse only, quiet, rate-limited', [choice('Tick',I,'tick_001'),choice('Scroll',I,'scroll_001'),choice('Select',I,'select_001')]],
  ['13-footsteps', 'Running footsteps (optional)', 'Player / RunStride: foot contact timing, grounded only; previews repeat four steps', [choice('Padded steps',P,'footstep_carpet_000'),choice('Deck steps',P,'footstep_concrete_000'),choice('Soft body taps',P,'impactSoft_medium_001')]],
]
const rate = 44100
function wav(file, pcm) {
  const h = Buffer.alloc(44)
  h.write('RIFF'); h.writeUInt32LE(36 + pcm.length,4); h.write('WAVEfmt ',8)
  h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(1,22)
  h.writeUInt32LE(rate,24); h.writeUInt32LE(rate*2,28); h.writeUInt16LE(2,32); h.writeUInt16LE(16,34)
  h.write('data',36); h.writeUInt32LE(pcm.length,40)
  fs.writeFileSync(file,Buffer.concat([h,pcm]))
}
const manifest = { date:'2026-09-24', status:'Candidates only; user selection pending; not integrated', creator:'Kenney / Kenney Vleugels', license:'CC0-1.0', licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/', processing:'Decoded to mono 44.1 kHz PCM16, peak normalized to -9 dBFS for audition; no pitch changes. Reels contain silence between A/B/C. Footstep previews repeat the candidate four times.', groups:[] }
for (const [id,title,trigger,options] of groups) {
  const samples = options.map((option,index) => {
    const source = path.join(root,option.pack,option.file)
    let pcm = execFileSync('ffmpeg',['-v','error','-i',source,'-f','s16le','-ac','1','-ar',String(rate),'pipe:1'],{maxBuffer:20*1024*1024})
    let peak = 0
    for(let i=0;i<pcm.length;i+=2) peak=Math.max(peak,Math.abs(pcm.readInt16LE(i)))
    if (!peak || !pcm.length) throw new Error(`Silent candidate: ${source}`)
    const gain=32767*Math.pow(10,-9/20)/peak
    for(let i=0;i<pcm.length;i+=2) pcm.writeInt16LE(Math.round(pcm.readInt16LE(i)*gain),i)
    const oneShotSeconds=pcm.length/(rate*2)
    if(id==='13-footsteps') {
      const stride=Math.max(Math.round(rate*.32)*2,pcm.length)
      const steps=Buffer.alloc(stride*3+pcm.length)
      for(let i=0;i<4;i++) pcm.copy(steps,i*stride)
      pcm=steps
    }
    const letter='ABC'[index]
    const preview=`${id}-${letter}.wav`
    wav(path.join(out,preview),pcm)
    Object.assign(option,{letter,preview:`previews/${preview}`,source:`${option.pack}/${option.file}`,sourceUrl:`https://kenney.nl/assets/${option.pack}`,sourceLicense:`${option.pack}/License.txt`,sha256:createHash('sha256').update(fs.readFileSync(source)).digest('hex'),oneShotSeconds,previewSeconds:pcm.length/(rate*2)})
    return pcm
  })
  const slotSeconds=Math.max(4,Math.ceil(Math.max(...samples.map(p=>p.length/(rate*2)))+.5))
  const reel=Buffer.alloc(slotSeconds*rate*2*3)
  samples.forEach((p,i)=>p.copy(reel,Math.round((slotSeconds*i+.15)*rate)*2))
  wav(path.join(out,`${id}-ABC.wav`),reel)
  manifest.groups.push({id,title,trigger,slotSeconds,options})
}
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
const lines=['# Sound audition — 24 September 2026','','User selection is pending. No sounds have been wired into the game.','','All candidates are Kenney CC0 assets. Original archives, source files, download URLs, license text and hashes are retained in this folder. Selected files must be recorded in the project CREDITS.md when integrated. No existing CREDITS file was found.','','The game currently has no sound playback. Reviewed the source for all three courses and observed Orbital Garden completing in the live Phaser fixture. Shield support exists in the controller but no collectible enables it in the current item catalog, so it is outside the current shortlist. Ambience and music are optional future layers, not required gameplay cues.','','Preview processing: '+manifest.processing,'']
for(const g of manifest.groups) {
  lines.push(`## ${g.title}`,g.trigger,'',`Reel: previews/${g.id}-ABC.wav. A begins 0.15s; B begins ${g.slotSeconds+.15}s; C begins ${g.slotSeconds*2+.15}s.`,'')
  for(const o of g.options) lines.push(`- ${o.letter}: ${o.label} — ${o.source}; ${o.sourceUrl}; CC0-1.0.`)
  lines.push('')
}
fs.writeFileSync(path.join(root,'README.md'),lines.join('\n'))
console.log(JSON.stringify(manifest.groups.map(g=>({id:g.id,slot:g.slotSeconds,durations:g.options.map(o=>+o.oneShotSeconds.toFixed(3))})),null,2))

