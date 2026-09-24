import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'

const root=path.resolve('assets/sfx-audition')
const dir=path.join(root,'landing-round2')
const rate=44100
function decode(file,filter) {
  return execFileSync('ffmpeg',['-v','error','-i',file,...(filter?['-af',filter]:[]),'-ac','1','-ar',String(rate),'-f','s16le','pipe:1'])
}
function save(name,pcm) {
  let peak=0
  for(let i=0;i<pcm.length;i+=2) peak=Math.max(peak,Math.abs(pcm.readInt16LE(i)))
  if(!peak) throw new Error('Silent preview')
  const gain=32767*Math.pow(10,-9/20)/peak
  for(let i=0;i<pcm.length;i+=2) pcm.writeInt16LE(Math.round(pcm.readInt16LE(i)*gain),i)
  // Padding is solely for the chat player; the source processing is recorded below.
  const body=Buffer.concat([Buffer.alloc(rate*.15*2),pcm,Buffer.alloc(rate*.4*2)])
  const h=Buffer.alloc(44)
  h.write('RIFF');h.writeUInt32LE(36+body.length,4);h.write('WAVEfmt ',8)
  h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22)
  h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34)
  h.write('data',36);h.writeUInt32LE(body.length,40)
  fs.writeFileSync(path.join(dir,name+'.wav'),Buffer.concat([h,body]))
}
const a=decode(path.join(root,'previews/01-jump-A.wav'))
const b=decode(path.join(root,'previews/01-jump-B.wav'))
const mix=Buffer.alloc(Math.max(a.length,b.length))
for(let i=0;i<mix.length;i+=2) mix.writeInt16LE(Math.max(-32768,Math.min(32767,(i<a.length?a.readInt16LE(i):0)+(i<b.length?b.readInt16LE(i):0))),i)
save('jump-J1-layered',mix)
save('jump-J2-sequential',Buffer.concat([a,b]))
const landing=[
  {id:'L1',name:'pillow',file:'pillow-bed-hq.mp3',author:'krnash',source:'https://freesound.org/people/krnash/sounds/389799/',download:'https://cdn.freesound.org/previews/389/389799_6136319-hq.mp3',filter:'atrim=start=0.63:end=1.23,asetpts=PTS-STARTPTS,afade=t=out:st=0.5:d=0.1'},
  {id:'L2',name:'pillow-thud',file:'falling-thud-hq.mp3',author:'septalium1',source:'https://freesound.org/people/septalium1/sounds/584293/',download:'https://cdn.freesound.org/previews/584/584293_13171815-hq.mp3',filter:'atrim=start=0.21:end=1.01,asetpts=PTS-STARTPTS,afade=t=out:st=0.7:d=0.1'},
  {id:'L3',name:'deep-pillow',file:'pillow-bed-hq.mp3',author:'krnash',source:'https://freesound.org/people/krnash/sounds/389799/',download:'https://cdn.freesound.org/previews/389/389799_6136319-hq.mp3',filter:'atrim=start=1.65:end=2.25,asetpts=PTS-STARTPTS,aresample=44100,asetrate=35280,aresample=44100,lowpass=f=1600,afade=t=out:st=0.6:d=0.15'},
]
for(const item of landing) {
  const sourceFile=path.join(dir,item.file)
  save(`landing-${item.id}-${item.name}`,decode(sourceFile,item.filter))
  item.license='CC0-1.0'
  item.sourceFormat='Freesound publicly available high-quality MP3 preview; original WAV not downloaded'
  item.sha256=createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex')
}
fs.writeFileSync(path.join(dir,'sources.json'),JSON.stringify({landing,jump:{J1:'Original jump A and B, simultaneous, equal pre-mix peaks',J2:'Original jump A immediately followed by B at 99.524 ms; no gap'},processing:'All previews peak-normalized to -9 dBFS, mono PCM16 44.1 kHz, with 150 ms leading and 400 ms trailing chat-player padding. No original synthesized sounds.'},null,2)+'\n')
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'))
const picks={'02-double-jump':'C','04-coin':'A','05-boost':'C','06-boost-expiry':'A','07-reactor-hit':'B','08-plasma-hit':'C','09-fall':'B','10-finish':'C','11-buttons':'A','12-hover':'C','13-footsteps':'B'}
const selected=Object.entries(picks).map(([id,letter])=>{
  const group=manifest.groups.find(g=>g.id===id)
  return {id,title:group.title,...group.options.find(o=>o.letter===letter)}
})
const jump=manifest.groups[0].options.slice(0,2)
fs.writeFileSync(path.join(root,'selections.json'),JSON.stringify({status:'Selection saved; not integrated. Awaiting jump arrangement and replacement landing choice.',jump:{sources:jump,arrangement:'pending: J1 simultaneous or J2 gapless sequential'},landing:'Previous A/B/C rejected as too hard/wooden. L1/L2/L3 pending.',selected},null,2)+'\n')
const credits=['# Credits','','## Selected sound effects (integration pending)','','Sound effects by **Kenney / Kenney Vleugels**, https://kenney.nl. Licensed under **Creative Commons Zero 1.0 (CC0-1.0)**: https://creativecommons.org/publicdomain/zero/1.0/. The included pack licenses permit personal and commercial use; attribution is optional and retained here.','','The user selected the files below on 24 September 2026. These are staged audition assets, not yet wired into gameplay. Jump layering and the replacement landing sound are pending final selection.','','| Use | Original file | Pack / source |','| --- | --- | --- |']
for(const o of [...jump.map(o=>({...o,title:'Jump layer '+o.letter})),...selected]) credits.push(`| ${o.title} | ${o.file} | [${o.pack}](${o.sourceUrl}) |`)
credits.push('','Original files and License.txt files are preserved under assets/sfx-audition/<pack>/. The audition manifest records SHA-256 hashes. Previews were decoded to mono 44.1 kHz PCM16 and peak-normalized; jump variants combine the two credited sources. Footstep audition previews repeat four steps, while the selected source is the single footstep_concrete_000.ogg.','','New landing candidates are not selected yet. Their authors, CC0 licenses, exact source URLs, hashes, and edits are recorded in assets/sfx-audition/landing-round2/sources.json; add the selected landing here when approved.','','Artwork provenance is documented separately in docs/ARTWORK.md.','')
if(fs.existsSync('CREDITS.md')) throw new Error('CREDITS.md already exists; merge deliberately rather than overwrite')
fs.writeFileSync('CREDITS.md',credits.join('\n'))
console.log('Saved 5 revised previews, selected asset manifest, landing provenance, and CREDITS.md.')
