// Deterministic sprite packaging only: preserve generated pixels and alpha, crop each grid cell,
// align its feet to (96,178), then assemble 12 equal Phaser frames.
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE || 'sharp')
const source = 'assets/source/mallow-source.png'
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const cw = info.width / 4, rows = [0, 370, 700, info.height]
const frames = [], metrics = []
for (let i = 0; i < 12; i++) {
  const row = Math.floor(i / 4)
  const ox = (i % 4) * cw, oy = rows[row], ch = rows[row + 1] - oy
  let x0 = cw, y0 = ch, x1 = 0, y1 = 0
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const n = ((oy + y) * info.width + ox + x) * 4
    if (data[n + 3] > 100) { x0 = Math.min(x0,x); y0 = Math.min(y0,y); x1 = Math.max(x1,x); y1 = Math.max(y1,y) }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1
  const sw = Math.round(w * .46), sh = Math.round(h * .46)
  const input = await sharp(source).extract({left:ox+x0,top:oy+y0,width:w,height:h}).resize(sw,sh).png().toBuffer()
  frames.push({input,left:(i%4)*192+Math.round(96-sw/2),top:Math.floor(i/4)*192+178-sh})
  metrics.push({frame:i,source:{x:ox+x0,y:oy+y0,w,h},width:sw,height:sh})
}
await sharp({create:{width:768,height:576,channels:4,background:'#00000000'}}).composite(frames).png().toFile('public/assets/mallow-atlas.png')
await sharp('assets/source/orbital-garden.png').webp({quality:90}).toFile('public/assets/orbital-garden.webp')
await writeFile('assets/source/mallow-frames.json',JSON.stringify(metrics,null,2))
console.log(metrics)
