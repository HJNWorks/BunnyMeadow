# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0 during development).

## [Unreleased]

### Changed

- Story and Endless letterbox the Phaser canvas between HUD chrome (and the map-editor dock)
  so fullscreen FIT no longer stretches under the bars. Camera zoom is 1.

### Added

- Guanghan boss Han: duck under roofs, eat a mooncake for a timed warmth buff, dash to
  clear five spirit hearts. Han roams the sky and aims frost/star fans at Mei. Shared
  top-right item tray for timed buffs (Story warmth, Endless lantern glow). Boss loop
  `boss` on the audio bus. Spirit hearts at top center. Silhouette shifts with enrage.
- World 4 Cloud Stair between Crane Summit and Guanghan: three stations, hanging
  bridges, frost wisps, ice spit, gale magpies. 4-2 and 4-3 have no Moon Pool. 4-3 is
  a left-closing gale. Moon unlocks after Closing Gale.
- Settings Story map editor (`contentFlags.storyMapEditor`): Play with fail-off, Build
  drag/inspector for platforms, bridges, critters, spawn, Moon Pool, and exit. Edits live
  in `localStorage` (`bunnymeadow.editor.overlay.v1`). Set active makes that overlay
  the live Story station in this browser. Map width, biome critter/item pickers.
  No Story progress writes. Removable via the flag and `src/modes/story/editor/`.
- Story map editor Undo: one restore per selected object, back to the first snapshot
  taken when that object was selected.
- Story HUD Mute next to Pause. Cuts master output without changing the volume sliders.
  Stored as `settings.audio.muted`.

## [0.2.0] - 2026-09-16

Web iterations I1-I4. Closes the last M5 leftovers (audio assets and i18n fill).

### Added

- Seeded biome-graph route walker with per-difficulty `bandMeters` so water and dusk can
  appear before 400 m.
- Plus or minus one tier jitter on streamed chunks.
- Enemy and item slots filled from biome rosters (`enemies.json` homeBiomes/minTier) and
  `items.json` tables.
- Mooncake (restore a heart), osmanthus blossom (one extra glide), lantern (push mist 80 m).
- Goat blocker on bamboo and osmanthus.
- `palettes.json` six-token kits plus hour and weather for the live rungs and moon.
- Weather specks, multiply night overlay, and lantern glow on Story and Endless.
- Ten Endless bridge chunks with sky and night lerp. Layered fog-coloured mist bands.
- Procedural Web Audio on the existing bus: pentatonic loops for menu, meadow, dusk,
  night, and moon, plus jump, dash, pickup, hurt, heart, mist, confirm, and cancel.
- DE and ZH-Hans copy for menus, HUD, World Map, Story overlay and epilogue, Endless
  lobby and results, and on-screen item hints, with `{name}` interpolation in `t()`.

### Changed

- Endless sky and HUD follow the chunk the player is in, not a metre cutoff.
- Seeds from the original 0.1.0 Endless build do not replay (walker, jitter, slot rolls,
  and queued bridges consume extra rng draws).
- Story and Endless platform grass tints come from the palette ground token.

## [0.1.0] - 2026-09-16

First tagged release. Story milestones M0-M5 complete; the game is web-playable on
GitHub Pages.

### Added

- Meadow arcade mode: data-driven maps, difficulty presets, enemy roster, cosmetics,
  pantry unlocks (M0-M2).
- Moon Tasks: Night Watch and Hide and Seek (M2).
- Story mode through the moon finale: World 0-3 stations, bosses (Fox Hu, Heron Fisher,
  Crane Envoy), Moon Pool checkpoints, and the Guanghan epilogue (M3-M4).
- Endless mode: seeded chunk-streamed runner with a difficulty-scaled mist chase wall,
  hearts and respawn, lantern glide, carrots to the pantry, and a local per-difficulty
  leaderboard (M5).
- Meta shell: Title, Mode Select, Settings, Customize, Achievements; save schema with
  migration; shared input action map; audio and i18n buses; content flags.
- Documentation tree under `docs/` covering the universe, bestiary, items, Endless
  design, and rendering language, plus the web iteration track.
- Repo hygiene: proprietary LICENSE, CONTRIBUTING guide, this changelog, a CI workflow,
  and Conventional Commits enforcement.

[Unreleased]: https://github.com/HJNWorks/BunnyMeadow/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/HJNWorks/BunnyMeadow/releases/tag/v0.2.0
[0.1.0]: https://github.com/HJNWorks/BunnyMeadow/releases/tag/v0.1.0
