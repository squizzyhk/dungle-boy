# Changelog

## 0.3.0 (2026-09-24)

- Added the owner-supplied Dungle Boy theme as looping menu music, with a music toggle, browser-unlock handling and a single shared track. Music pauses during levels; gameplay music remains reserved for later.

- Preserved Orbital Garden's authored layout and speed curve.
- Replaced levels 2 and 3 with Crystal Aqueduct and Ember Foundry: new painted backgrounds, distinct platform layouts, and six versus eleven level-kit hazards.
- Activated reactor crates, crystal clusters, animated retracting spikes and plasma rotors in gameplay. Hazards use per-frame opaque-pixel contact checks; spike damage is confined to crystal geometry, excluding sockets and glow. Original spike triangles also reject their empty corners.
- Added working speed pads, jump orbs, single-hit shields and coin magnets, with timed effects and pickup collision bodies.
- Added actual-art collision regressions, unboosted route checks at 60/120 Hz, and a visible Arcade contact fixture. Added Sharp as an explicit development dependency for reproducible artwork packing and tests.

Validation: all 52 automated tests and the production build pass. Both replacement courses completed through live Phaser playback with pickups enabled; eight live collision-contact checks passed. Source and runtime theme hashes match, the MP3 fully decodes, and menu playback, toggle, gameplay pause and return-to-menu resume were verified with one audio instance. The existing large-bundle warning remains.

Release body: [v0.3.0](docs/releases/v0.3.0.md).

## 0.2.0 (2026-09-24)

- Rebuilt Orbital Garden, Relay Heights and Stardust Sprint with orbital artwork, revised routes, reactor obstacles and collectible arcs.
- Added painted marshmallow source art, jump/landing atlas, shared 24-frame running animation and spring-driven visual deformation.
- Added the orbital garden background, mechanical finish mast, hologram and celebration effects; revised menus and UI styling.
- Integrated 13 selected sound effects with playback tied to accepted movement, impacts, pickups, boost expiry, death cause and UI actions. Retained sources, licenses, credits and reproduction scripts.
- Added eight reusable level-kit assets with 50 total frames, transparent runtime sheets, icons, manifest, original images and generation prompts.
- Added an optional Phaser level-kit loader, deterministic packing script and browser animation gallery. New hazard/power-up behavior and additional courses are not included.
- Fixed the Menu button after death and adjusted its inset.
- Established the project release-note convention, based on Squarepad, without profanity and signed `squiz + caspa + the machines`.

Validation: 43 tests passed and the production build passed before release packaging. The asset gallery was inspected in the browser. Existing artwork/audio documentation records course playback and audio verification. Vite reports a large JavaScript bundle warning; no new performance claim is made.

Release body: [v0.2.0](docs/releases/v0.2.0.md).
