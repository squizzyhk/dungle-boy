import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const root = 'assets/sfx-audition'
const output = 'public/assets/audio'
fs.mkdirSync(output, {recursive:true})
const selections = JSON.parse(fs.readFileSync(`${root}/selections.json`, 'utf8'))
const names = ['doubleJump','coin','boost','boostExpiry','reactor','spike','fall','finish','button','hover','footstep']
for (let i=0;i<selections.selected.length;i++) {
  const selected=selections.selected[i]
  // PCM preview already has the approved normalization; footsteps need just
  // their original single step, not the repeated audition sequence.
  const preview=`${root}/${selected.preview}`
  const args=['-v','error','-y','-i',preview]
  if(names[i]==='footstep') args.push('-t',String(selected.oneShotSeconds))
  args.push('-ac','1','-ar','44100',`${output}/${names[i]}.wav`)
  execFileSync('ffmpeg',args)
}
for(const [name,file,duration] of [
  ['jump','jump-J1-layered.wav',0.46730158730158733],
  ['landing','landing-L3-deep-pillow.wav',0.75],
]) execFileSync('ffmpeg',['-v','error','-y','-i',`${root}/landing-round2/${file}`,'-ss','0.15','-t',String(duration),'-ac','1','-ar','44100',`${output}/${name}.wav`])
selections.status='Integrated: J1 simultaneous jump layers and L3 deep pillow landing, plus all selected cues.'
selections.jump.arrangement='J1 simultaneous'
selections.landing={id:'L3',source:'landing-round2/pillow-bed-hq.mp3',author:'krnash',license:'CC0-1.0',sourceUrl:'https://freesound.org/people/krnash/sounds/389799/',processing:'Source 1.65–2.25 seconds, slowed to 80% speed, low-pass at 1600 Hz, faded tail; -9 dBFS peak. Preview padding removed.'}
fs.writeFileSync(`${root}/selections.json`,JSON.stringify(selections,null,2)+'\n')
console.log('Built 13 selected gameplay WAV files.')


