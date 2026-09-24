# Orbital level kit

Eight reusable illustrated assets matching the orbital garden palette: lavender metal, indigo shadows, mint light and peach crystals. Generated with the built-in image tool on 2026-09-24. Original images and exact prompts are retained in `assets/source/level-kit/`.

## Contents

| Asset | Folder | Frames | Playback | Intended use |
|---|---|---:|---:|---|
| reactor-crate | obstacles | 1 | Static | Solid reactor obstacle |
| crystal-cluster | obstacles | 1 | Static | Stationary crystal hazard |
| retracting-spikes | obstacles | 8 | 8 fps | Retract / extend trap |
| plasma-rotor | obstacles | 8 | 12 fps | Rotating blade hazard |
| boost-pad | pads | 8 | 10 fps | Pulsing directional speed pad |
| jump-orb | powerups | 8 | 10 fps | Mint jump pickup |
| shield-orb | powerups | 8 | 10 fps | Blue shield pickup |
| magnet-orb | powerups | 8 | 10 fps | Peach magnet pickup |

Runtime PNGs live under `public/assets/level-kit/`. Each animated sheet is 1024 × 512 with a 4 × 2 grid of 256 × 256 frames, read left-to-right then top-to-bottom. Static sprites and separate `-icon.png` thumbnails are 256 × 256. All have genuine alpha transparency, no baked background. `manifest.json` includes URLs, source crop rectangles, frame counts, rates and origins.

Grounded props use origin `(0.5, 0.9375)`, placing the bottom anchor at source pixel `(128, 240)`; rotor and pickups use `(0.5, 0.5)`. Keep transparent padding when loading. Do not use the entire padded frame as a collision rectangle. Choose gameplay bodies independently of glow and illustration bounds. Suggested initial display scale: 0.25–0.5, tuned to each level. Generated animation has subtle hand-painted frame variation.

The spike sequence is retracted, tips, half, extended, glowing extended, extended, half, tips. Damage activation must be coordinated with the chosen animation phase by the level implementation. The library provides visuals only; shield, magnet, speed-pad effects, moving hazards, collision rules and new levels are not implemented by this asset addition.

## Phaser use

`src/graphics/LevelKit.ts` is an optional loader and sprite factory. Existing scenes and artwork are untouched by this module until explicitly imported and called.

```ts
import { preloadLevelKit, addLevelKitSprite } from '../graphics/LevelKit'

// In scene.preload():
preloadLevelKit(this)

// In scene.create(), after loading:
const pad = addLevelKitSprite(this, 'boost-pad', 640, 420, 0.5)
pad.setDepth(4)
```

Keys are namespaced as `level-kit:<id>` for both textures and animations. Animated sprites loop automatically. Callers own sprite cleanup and all gameplay behavior.

## Preview and rebuild

Run `npm run dev`, then visit `/tools/level-kit-preview.html`. The gallery animates all six sheets and provides pause, playback speed and frame-bound controls.

Run `node tools/pack-level-kit.mjs` to repack originals. The script requires Sharp, like the existing mallow packers; `SHARP_MODULE` can point at an installed Sharp module. It checks nonempty frames and transparent backgrounds, uses a shared scale within each animation, and writes runtime sheets, icons and manifest. Exact generation prompts are in `assets/source/level-kit/prompts.json` (common prompt plus per-asset prompt).

Validation: all eight sheets packed successfully with alpha and nonempty-frame checks. The rendered browser gallery was inspected with changing animation frames, including lower-row pads and orbs. The TypeScript/production build passes; Vite reports the existing large-bundle warning.
