export type HazardKind = 'crate' | 'spike' | 'reactor-crate' | 'crystal-cluster' | 'retracting-spikes' | 'plasma-rotor'
export type Rect = { x: number; y: number; width: number; height: number }
type Point = readonly [number, number]

function inPolygon(x: number, y: number, points: Point[]): boolean {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j]
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}

function inTriangle(x: number, y: number, a: Point, b: Point, c: Point): boolean {
  const cross = (p: Point, q: Point) => (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1])
  const d = [cross(a, b), cross(b, c), cross(c, a)]
  return !(d.some(v => v < 0) && d.some(v => v > 0))
}

/** Geometry restricts damage to crystals, never their harmless mounting sockets. */
export function insideDamageShape(kind: HazardKind, frame: number, x: number, y: number): boolean {
  if (kind === 'spike') {
    // The original artwork draws three triangles over a separate mounting strip.
    return [0, 1, 2].some(i => inTriangle(x, y, [i / 3, 33 / 36], [(i + .5) / 3, 0], [(i + 1) / 3, 33 / 36]))
  }
  if (kind === 'retracting-spikes') {
    const tips = [null, [148, 138, 151], [130, 95, 131], [83, 38, 82], [80, 28, 82], [75, 36, 79], [130, 93, 128], [155, 140, 153]][frame % 8]
    if (!tips) return false
    return tips.some((tip, i) => {
      const center = [78, 128, 180][i], half = i === 1 ? 21 : 16
      return inTriangle(x * 256, y * 256, [center, tip], [center - half, 178], [center + half, 178])
    })
  }
  if (kind === 'crystal-cluster') {
    return inPolygon(x * 256, y * 256, [[128,16],[85,82],[94,149],[108,183],[152,184],[175,91]]) ||
      inPolygon(x * 256, y * 256, [[41,109],[82,136],[101,179],[83,190],[48,161]]) ||
      inPolygon(x * 256, y * 256, [[214,108],[172,133],[155,179],[176,191],[211,165]])
  }
  return true
}

export function damageMask(rgba: ArrayLike<number>, width: number, height: number, kind: HazardKind, frame: number): Uint8Array {
  const mask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    // Soft bloom is decoration; only solid painted pixels can hurt.
    mask[y * width + x] = rgba[(y * width + x) * 4 + 3] >= 220 && insideDamageShape(kind, frame, (x + .5) / width, (y + .5) / height) ? 1 : 0
  }
  return mask
}

/** Broad-phase rectangles are only a search area. Test actual opaque damage pixels. */
export function maskTouchesPlayer(mask: Uint8Array, width: number, height: number, hazard: Rect, player: Rect): boolean {
  const sx = hazard.width / width, sy = hazard.height / height
  const left = Math.max(0, Math.floor((player.x - hazard.x) / sx))
  const right = Math.min(width, Math.ceil((player.x + player.width - hazard.x) / sx))
  const top = Math.max(0, Math.floor((player.y - hazard.y) / sy))
  const bottom = Math.min(height, Math.ceil((player.y + player.height - hazard.y) / sy))
  const radius = Math.min(7, player.width / 4, player.height / 4)
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    if (!mask[y * width + x]) continue
    const wx = hazard.x + (x + .5) * sx, wy = hazard.y + (y + .5) * sy
    const cx = Math.max(player.x + radius, Math.min(player.x + player.width - radius, wx))
    const cy = Math.max(player.y + radius, Math.min(player.y + player.height - radius, wy))
    if ((wx - cx) ** 2 + (wy - cy) ** 2 <= radius ** 2) return true
  }
  return false
}
