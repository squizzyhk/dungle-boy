import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE || 'sharp')
const root = 'public/assets/level-kit'
const specs = [
  ['reactor-crate', 'obstacles', 1, 0, 'bottom'],
  ['crystal-cluster', 'obstacles', 1, 0, 'bottom'],
  ['retracting-spikes', 'obstacles', 8, 8, 'bottom'],
  ['plasma-rotor', 'obstacles', 8, 12, 'center'],
  ['boost-pad', 'pads', 8, 10, 'bottom'],
  ['jump-orb', 'powerups', 8, 10, 'center'],
  ['shield-orb', 'powerups', 8, 10, 'center'],
  ['magnet-orb', 'powerups', 8, 10, 'center'],
]
await mkdir(root, { recursive: true })
const manifest = { version: 1, frameOrder: 'left-to-right, top-to-bottom', assets: [] }
for (const [id, category, count, fps, anchor] of specs) {
  await mkdir(`${root}/${category}`, { recursive: true })
  const source = `assets/source/level-kit/${id}.png`
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  if (!info.channels || info.channels !== 4) throw new Error(`${id}: missing alpha`)
  const cols = count === 1 ? 1 : 4, rows = count === 1 ? 1 : 2
  const cw = Math.floor(info.width / cols), ch = Math.floor(info.height / rows)
  const regions = []
  for (let i = 0; i < count; i++) {
    const ox = (i % cols) * cw, oy = Math.floor(i / cols) * ch
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1, transparent = 0
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const a = data[((oy + y) * info.width + ox + x) * 4 + 3]
      if (a < 8) transparent++
      if (a > 8) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
    }
    if (x1 < 0 || transparent < cw * ch * .1) throw new Error(`${id} frame ${i}: empty or opaque background`)
    regions.push({ left: ox + x0, top: oy + y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
  }
  const scale = Math.min(224 / Math.max(...regions.map(r => r.width)), 224 / Math.max(...regions.map(r => r.height)))
  const frames = []
  for (const r of regions) {
    const width = Math.max(1, Math.round(r.width * scale)), height = Math.max(1, Math.round(r.height * scale))
    const cutout = await sharp(source).extract(r).resize(width, height).png().toBuffer()
    frames.push(await sharp({ create: { width: 256, height: 256, channels: 4, background: '#00000000' } })
      .composite([{ input: cutout, left: Math.round((256 - width) / 2), top: anchor === 'bottom' ? 240 - height : Math.round((256 - height) / 2) }]).png().toBuffer())
  }
  const filename = `${category}/${id}.png`
  await sharp({ create: { width: cols * 256, height: rows * 256, channels: 4, background: '#00000000' } })
    .composite(frames.map((input, i) => ({ input, left: (i % cols) * 256, top: Math.floor(i / cols) * 256 }))).png().toFile(`${root}/${filename}`)
  await sharp(frames[0]).toFile(`${root}/${category}/${id}-icon.png`)
  manifest.assets.push({ id, category, url: `/assets/level-kit/${filename}`, icon: `/assets/level-kit/${category}/${id}-icon.png`, frameWidth: 256, frameHeight: 256, columns: cols, rows, frameCount: count, fps, repeat: count > 1 ? -1 : 0, origin: { x: .5, y: anchor === 'bottom' ? .9375 : .5 }, source, sourceRegions: regions })
}
await writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Packed ${manifest.assets.length} assets; transparent 256px frames.`)
