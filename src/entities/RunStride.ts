export const RUN_FRAME_COUNT = 24
export const RUN_STANCE = 0.48
export type LegPose = { x: number; y: number; planted: boolean }

/** Tiny alternating steps under the belly, with no knee or ankle joint.
 * The rounded end pushes back on the ground and lifts only slightly to recover. */
export function legAt(phase: number): LegPose {
  const p = ((phase % 1) + 1) % 1
  if (p < RUN_STANCE) {
    const stance = p / RUN_STANCE
    return { x: 14 - 28 * stance, y: 165.5, planted: true }
  }
  const swing = (p - RUN_STANCE) / (1 - RUN_STANCE)
  const ease = swing * swing * (3 - 2 * swing)
  return {
    x: -14 + 28 * ease,
    y: 165.5 - 6 * Math.sin(Math.PI * swing) ** 2,
    planted: false,
  }
}

export function strideAt(phase: number) {
  const weight = Math.cos(phase * Math.PI * 4)
  return {
    near: legAt(phase),
    far: legAt(phase + 0.5),
    // Weight lands twice per cycle; the torso softly compresses at each contact.
    bob: 2.2 * weight,
    squash: 0.022 * weight,
    armAngle: Math.cos(phase * Math.PI * 2) * 0.22,
  }
}
