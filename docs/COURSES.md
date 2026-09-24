# Course rebuild

Level 1's configuration is unchanged from v0.2.0, including all segments and speed settings. The branch `codex/backup-before-new-courses` preserves the prior revision. Shared precise spike contact is a safety improvement across all courses.

## Crystal Aqueduct

Level 2 replaces Relay Heights. A new mint daylight aqueduct painting, cool-tinted decks, widely separated introductions to all four hazard types, and two isolated ascending islands distinguish it from Orbital Garden. Six hazards span a 6,800-pixel course. Optional upper shelves offer a shield and jump orb; the main route includes a magnet and a speed pad. The unboosted route remains valid regardless of trap animation phase.

## Ember Foundry

Level 3 replaces Stardust Sprint. A new amber industrial background and warm decks accompany eleven hazards across 8,700 pixels. Shorter recovery intervals, a suspended rotor with a safe ground passage, two furnace bridges and a boosted final stretch increase the challenge. No power-up is required to finish either new course.

## Collision and animation

- Arcade rectangles perform only the broad search for nearby hazards. `HazardCollision.ts` then tests solid pixels of the exact displayed animation frame against the player's rounded collision body.
- Crystal geometry in `HazardShape.ts` excludes sockets. Alpha below 220 is ignored so glows cannot kill. Frame 0 of a retracting trap has no damaging pixels.
- Animated hazards use 256-pixel frames from the level kit with authored starting phases. Masks are cached per texture/frame and released with their texture via a WeakMap.
- Speed pads have a narrow contact strip aligned to the visible plate. Orbs have circular pickup bodies. Magnets move coins and refresh their Arcade bodies together.
- The player's collision body is intentionally smaller than its squash/stretch artwork. Cosmetic limbs and glow are not lethal contact surfaces.

## Artwork

Generated with built-in imagegen. Exact prompts: `assets/source/course-background-prompts.json`.

- `assets/source/crystal-aqueduct.png` → `public/assets/crystal-aqueduct.webp`
- `assets/source/ember-foundry.png` → `public/assets/ember-foundry.webp`

The runtime backgrounds are 1920×1080 WebP images. Existing Orbital Garden artwork is unchanged.

## Verification

`npm test` checks the actual shipped PNG masks, empty spike corners, solid blade contacts, retracting-frame safety, timed pickup effects, and full unboosted routes at 60 and 120 Hz. Route tests union all animation frames, so passing cannot depend on a conveniently retracted trap. Existing level-1 route tests remain.

`/tools/visual-qa.html` plays authored jump inputs through Phaser with real pickups enabled. Its **Check spike contacts** button tests eight positive/negative cases through actual Arcade overlap and the runtime mask filter. These development tools are not included in the production entry point.

Final checks: 48 tests pass; production build passes with the existing bundle-size warning. Crystal Aqueduct completed in the live fixture with 10 first jumps and one double jump; Ember Foundry uses 14 first jumps and one double jump. All eight live contact checks passed, including original spike corners, actual spike tips, a retracted trap and the harmless socket. New backgrounds and foreground hazards were inspected in the running game.
