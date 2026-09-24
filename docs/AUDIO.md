# Audio

## Menu themes

The four owner-supplied MP3s are copied unchanged into `public/assets/audio/music/`. All are stereo MP3 files at 48 kHz.

| Playlist position | Runtime file | Duration | SHA-256 |
| --- | --- | --- | --- |
| 1 | `dungle-boy-theme.mp3` | 84.36 s | `15d1ce399c23080efc5b830a5557fa05b7589b4283e1ef1183016e400bc478d4` |
| 2 | `dungle-boy-theme-2.mp3` | 66.40 s | `329e05c25e147166f7e2438f70a61172e051611174afae9a869a5b9ebaf22953` |
| 3 | `dungle-boy-theme-3.mp3` | 57.56 s | `758a6cf81d9ace95e080fa1ff8df085070b92fbeca69f91eb1610780aff62ac4` |
| 4 | `dungle-boy-theme-4.mp3` | 64.32 s | `c4e89db70a23c24049b9b721323b7c8f53f28545b20f7522bb53e8040f3f18aa` |

`src/audio/music.ts` owns one ordered playlist at 45% volume, shared by the main, game-over and level-clear menus. Each track advances directly into the next; theme 4 returns to the original theme. The current track pauses before gameplay and resumes its position on returning to a menu. There is no level music yet. Each menu has a music on/off control; the setting lasts for the current game session. Browser audio restrictions may require a click/tap first. A pending unlock cannot start music after entering a level, and scene shutdown cannot leave menu music running.

Verification: all four source and repo file hashes match, and every complete MP3 decodes without errors. Playlist lifecycle tests cover preload order, all four transitions, wraparound, resume, scene shutdown and late browser unlock. Listening balance can be adjusted independently of sound-effect volumes.

## Sound effects

The approved set is integrated: J1 layers the first jump's pluck and phase jump simultaneously; L3 uses krnash's deep, filtered pillow recording for landing. The other eleven selections are recorded in `assets/sfx-audition/selections.json` and `CREDITS.md`.

Run `node tools/build-selected-sfx.mjs` to reproduce the 13 gameplay WAV files. Audition padding is removed from jump and landing; footsteps use the single approved concrete step rather than the four-step preview. Audition sources and original license files remain under `assets/sfx-audition/`. No newly synthesized audio is used.

`src/audio/sfx.ts` preloads and plays the shared Phaser sounds. Its volume table keeps steps and hover feedback below gameplay cues. Playback uses Phaser's global manager so button and finish tails survive scene changes. Browser audio unlock retains only the first button click, never a backlog of footsteps.

Player sounds follow accepted jumps, meaningful air-to-ground impacts, and the visible run cycle's half-cycle changes. Steps stop when airborne, dead, or finished. Boost expiry fires only when the final boost ends. Death is one cue selected by cause: reactor, spike, or falling below the kill boundary. Menu, retry, and next-level buttons share the approved click.

Validation: `npm run build`; `npm test` (43 tests including audio lock, missing-asset and volume checks). `tools/visual-qa.html` displays audio decode and successful playback counts, offers an all-sounds audition, and runs actual Phaser courses. Browser verification loaded all 13 assets and played each, and completed Orbital Garden with movement, coin and finish cues. Playback counters verify the engine's playback events; final loudness balance remains a listening preference.
