# Orbital rebuild artwork

## Current running animation: soft stubby stride

The run uses Kirby-inspired weight and timing while retaining the marshmallow character. Each leg is one rounded lobe growing from the body, with no knee, ankle, shoe, or separately rotating foot. The limbs take tiny alternating steps under the belly: 28 px total horizontal travel and only 6 px lift in the 192 px atlas frame. A subtle lavender shade separates the far leg. The broad torso leans forward, bobs 2.2 px, and compresses about 2 percent as each step lands; arms have only a small counter-swing.

The shared 24-frame run replaces the earlier pedalling rig in both gameplay and the menu. Jump/landing artwork and impact-driven spring recoil remain. The platform caption has an opaque nameplate above the platform artwork.

Generated using the built-in image tool, preserving the previous mallow reference:
- `assets/source/mallow-rig-source.png`: original transparent cutout sheet.
- `public/assets/mallow-body.png` and `mallow-arm.png`: generated torso and arm cutouts used by the run. The earlier foot cutout is retained as source history but is no longer loaded or rendered.
- `tools/pack-mallow-rig.mjs`: reproducible transparent crop packaging using Sharp.
- `src/graphics/MallowRun.ts`: 24-frame runtime atlas assembly.
- `src/entities/RunStride.ts`: planted/swinging foot paths and opposing leg phases.

Prompt:

Use case: identity-preserve. Edit the reference character into a production animation cutout rig asset sheet. Preserve EXACTLY the existing cute marshmallow character identity: cream-white softly shaded cylindrical body, subtly toasted top, lavender shadows, glossy black oval eyes, blush cheeks, open happy mouth, facing right in three-quarter side view. Same high quality painted 2D cartoon style. Do not create a pose sheet. Create EXACTLY THREE DISCONNECTED PARTS on REAL transparent alpha background. LEFT TWO THIRDS: ONE large upright torso/head, a complete rounded marshmallow cylinder with face, absolutely NO arms, NO legs, NO feet attached, no stumps or protrusions, smooth uninterrupted silhouette. Face/body proportions closely match reference first frame. TOP RIGHT: ONE separate short soft capsule-shaped arm hanging vertically, rounded shoulder at top and mitten-like rounded end at bottom, no fingers. BOTTOM RIGHT: ONE separate puffy foot, horizontal pointing RIGHT, bean-like marshmallow foot with rounded heel on left and slightly larger rounded toe on right; no leg attached. Plenty of clear space between all three parts. No text, no panels, no grid, no ground, no background, no shadow outside objects. This is a rig sheet for a skeleton-driven animation where limbs will be articulated in code; only render these three clean components.

Validation: 39 tests pass, including alternating legs, compact recovery beneath the belly, ground contact, seamless cycle boundaries, all 24 frames, and existing jump/landing checks. The production build passes. The new run was inspected at normal and quarter speed with side-by-side contact/passing poses; the menu nameplate was visually checked.

Generated with the built-in image generation tool on 2026-09-24.

- `assets/source/mallow-source.png`: original transparent twelve-pose character sheet.
- `public/assets/mallow-atlas.png`: game-ready 4 by 3 atlas, 192 px frames, foot anchor (96,178).
- `assets/source/orbital-garden.png`: original painted environment.
- `public/assets/orbital-garden.webp`: compressed in-game environment.
- `tools/pack-mallow.mjs`: deterministic cropping and atlas packing; uses Sharp (`SHARP_MODULE` may identify an installed module).

The body artwork uses hand-painted run, launch, apex, fall, and squash poses. Runtime spring motion adds volume-preserving stretch, impact-driven compression, overshoot, and settling without deforming the collision body. Courses, reactor sizes, collectible arcs, and jump routes were rebuilt. The finish is a code-drawn mechanical mast with a billowing hologram, orbital beacon, and completion particles.

## Generation prompts

### Character

Use case: stylized-concept. Asset type: production 2D game character animation spritesheet with REAL transparent alpha background. Create a high-quality hand-painted 2D animated marshmallow hero, no clothing, white pillowy short rounded cylindrical marshmallow body, subtle toasted-cream shading, lavender reflected light, tiny black oval eyes, warm cheek blush, small joyful mouth, two short puffy arms and two soft stubby legs. Polished fluid cartoon feature-animation look, dimensional soft shading but clearly illustrated 2D, crisp silhouette, expressive lovable design. Faces to the RIGHT in consistent three-quarter side view, ready for a side-scrolling platformer. EXACTLY 12 separate complete poses in a perfectly regular 4-column by 3-row grid; equal-size cells with generous transparent gutters, no overlap, same character body size and camera in every cell, feet baseline consistent. Read LEFT TO RIGHT each row. Row1: running frames 1-4: front foot contact, compress/down, passing, rising airborne. Row2: running frames 5-8: opposite foot contact, compress/down, opposite passing, rising airborne. Clearly articulate and alternate both arms and feet, real running cycle. Row3: landing/crouch with wide squished body, takeoff elongated stretching with arms back, apex jump with knees tucked and arms out, falling with feet extended and arms up. Full character in every cell. No text, no outlines of cells, no floor, no shadows outside body, no checkerboard image: genuine transparent background. Landscape spritesheet 4:3 aspect ratio.

### Environment

Use case: stylized-concept. Asset type: background plate for a premium hand-painted 2D side-scrolling sci-fi platformer. Wide cinematic alien orbital garden suspended above clouds at twilight. Sweeping enormous lavender ringed gas giant in upper right, tiny stars, luminous teal aurora ribbons drifting across a deep navy to violet to peach gradient sky. Elegant distant futuristic towers and floating terraces with little glowing cyan windows, curved space station architecture and antennae fading into mist along the bottom third. Distant small hovering craft. Dreamlike soft gouache-painted gradients and finely crafted animation background, sophisticated atmospheric perspective, calm negative space in left upper half for game UI. Playable platforms will be layered separately: NO foreground floor, NO foreground obstacles, NO people, NO characters, NO text, NO logos, NO interface, NO frames. Landscape 16:9, rich indigo/violet with mint/peach light accents. Make foreground silhouette readability easy, keep all architecture distant and lower contrast.

## Verification

`npm test` checks spring settling and stability, controls, powers, and complete unboosted routes at 60 and 120 Hz. `tools/visual-qa.html` is a development-only browser fixture for actual Phaser route playback and motion/finish inspection; it is not an entry in the production build.

Live browser playback also completed all three courses using normal jump inputs through the actual Phaser physics engine. Orbital Garden: 7 jumps, Relay Heights: 8, Stardust Sprint: 9. Every frame 0-11 was observed in each run. Finish flag and celebration were visually checked, and browser error/warning logs were empty.
