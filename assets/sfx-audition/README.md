# Sound audition — 24 September 2026

The approved selections are now integrated. See selections.json, ../../CREDITS.md, and ../../docs/AUDIO.md. The shortlist below is retained as the original audition record.

All candidates are Kenney CC0 assets. Original archives, source files, download URLs, license text and hashes are retained in this folder. Selected files must be recorded in the project CREDITS.md when integrated. No existing CREDITS file was found.

The game currently has no sound playback. Reviewed the source for all three courses and observed Orbital Garden completing in the live Phaser fixture. Shield support exists in the controller but no collectible enables it in the current item catalog, so it is outside the current shortlist. Ambience and music are optional future layers, not required gameplay cues.

Preview processing: Decoded to mono 44.1 kHz PCM16, peak normalized to -9 dBFS for audition; no pitch changes. Reels contain silence between A/B/C. Footstep previews repeat the candidate four times.

## Jump
Player.tick: accepted first jump only

Reel: previews/01-jump-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Pluck — interface-sounds/Audio/pluck_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- B: Phase jump — digital-audio/Audio/phaseJump1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- C: Slime spring — sci-fi-sounds/Audio/slime_000.ogg; https://kenney.nl/assets/sci-fi-sounds; CC0-1.0.

## Double jump
Player.tick: accepted double jump; distinct from first jump

Reel: previews/02-double-jump-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: High rise — digital-audio/Audio/highUp.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- B: Phase burst — digital-audio/Audio/phaseJump3.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- C: Maximize — interface-sounds/Audio/maximize_003.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.

## Landing
Player.trackGroundContact: air-to-ground transition, volume scaled by fall speed

Reel: previews/03-landing-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Soft impact — impact-sounds/Audio/impactSoft_medium_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- B: Light impact — impact-sounds/Audio/impactGeneric_light_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- C: Light deck impact — impact-sounds/Audio/impactPlate_light_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.

## Coin pickup
GameScene.onPickup: coin only, once per item

Reel: previews/04-coin-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Glass chime — interface-sounds/Audio/glass_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- B: Two-tone — digital-audio/Audio/twoTone1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- C: Pep blip — digital-audio/Audio/pepSound1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.

## Jump boost acquired
GameScene.onPickup: jump-boost; five-second effect

Reel: previews/05-boost-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Power-up 1 — digital-audio/Audio/powerUp1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- B: Power-up 6 — digital-audio/Audio/powerUp6.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- C: Confirmation — interface-sounds/Audio/confirmation_002.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.

## Jump boost expires
PowerupController.update: final active jump boost expires; avoid false cues for overlapping boosts

Reel: previews/06-boost-expiry-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: High down — digital-audio/Audio/highDown.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- B: Minimize — interface-sounds/Audio/minimize_003.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- C: Low down — digital-audio/Audio/lowDown.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.

## Reactor collision
GameScene.onHazard: crate texture; one lethal impact, no duplicate game-over sting

Reel: previews/07-reactor-hit-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Soft heavy bump — impact-sounds/Audio/impactSoft_heavy_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- B: Metal bump — impact-sounds/Audio/impactMetal_medium_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- C: Punch impact — impact-sounds/Audio/impactPunch_medium_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.

## Plasma collision
GameScene.onHazard: spike texture; one lethal zap

Reel: previews/08-plasma-hit-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Zap — digital-audio/Audio/zap1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- B: Force field — sci-fi-sounds/Audio/forceField_000.ogg; https://kenney.nl/assets/sci-fi-sounds; CC0-1.0.
- C: Alternate zap — digital-audio/Audio/zap2.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.

## Fall into a gap
GameScene.fail: distinguish KILL_Y from hazard death; do not play for a recoverable descent

Reel: previews/09-fall-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Phaser descent — digital-audio/Audio/phaserDown1.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- B: Three-tone descent — digital-audio/Audio/zapThreeToneDown.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.
- C: Low tumble — digital-audio/Audio/lowRandom.ogg; https://kenney.nl/assets/digital-audio; CC0-1.0.

## Finish celebration
GameScene.win / FinishGate.celebrate: once at crossing; audio survives results overlay

Reel: previews/10-finish-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Pizzicato jingle — music-jingles/Audio/Pizzicato jingles/jingles_PIZZI00.ogg; https://kenney.nl/assets/music-jingles; CC0-1.0.
- B: Steel jingle — music-jingles/Audio/Steel jingles/jingles_STEEL00.ogg; https://kenney.nl/assets/music-jingles; CC0-1.0.
- C: Compact confirmation — interface-sounds/Audio/confirmation_004.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.

## Button press
addButton pointerdown: level select, retry, next, menu; shared sound

Reel: previews/11-buttons-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Click — interface-sounds/Audio/click_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- B: Select — interface-sounds/Audio/select_002.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- C: Switch — interface-sounds/Audio/switch_003.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.

## Button hover (optional)
addButton pointerover: mouse only, quiet, rate-limited

Reel: previews/12-hover-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Tick — interface-sounds/Audio/tick_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- B: Scroll — interface-sounds/Audio/scroll_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.
- C: Select — interface-sounds/Audio/select_001.ogg; https://kenney.nl/assets/interface-sounds; CC0-1.0.

## Running footsteps (optional)
Player / RunStride: foot contact timing, grounded only; previews repeat four steps

Reel: previews/13-footsteps-ABC.wav. A begins 0.15s; B begins 4.15s; C begins 8.15s.

- A: Padded steps — impact-sounds/Audio/footstep_carpet_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- B: Deck steps — impact-sounds/Audio/footstep_concrete_000.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.
- C: Soft body taps — impact-sounds/Audio/impactSoft_medium_001.ogg; https://kenney.nl/assets/impact-sounds; CC0-1.0.

