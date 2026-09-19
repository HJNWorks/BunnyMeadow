# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0 during development).

## [Unreleased]

### Added

- Shared pad catalog under [docs/platforms/](docs/platforms/README.md): collision,
  motion (including slide), surface, and break as stacked axes for Story, Endless,
  and Bunny Jump.
- Creature voice catalog at [docs/creatures/voices.md](docs/creatures/voices.md) and
  `src/data/voices.json`. Cue ids match later wavs under `public/voices/{lang}/`.
- Moon Tasks hub and Bunny Jump design (docs only, planned). Vertical hop under
  Moon Tasks, not a fifth primary mode. Height bands reuse palettes. Jump roles stay
  mode-only. `land` is a one-bounce break source. Iteration:
  [docs/iterations/i5-bunny-jump.md](docs/iterations/i5-bunny-jump.md).

### Changed

- Last-heart Han beam damages every registered ledge the hot slab crosses. Thin
  Guanghan ledges take stone even if an editor overlay omitted `break`. Cracks
  darken the tile from the first contact.

- Editor Build pins critters where they were placed. Refresh no longer snaps them onto
  the nearest floor.
- Beating Han unlocks Mei's moon helmet in Customize (`MOON_RETURN`). Cosmetic only.
- Han's lunar beam leaves from the half-moon on his helmet.
- Objects can carry a `break` profile. Last-heart beam (5.5 s) breaks Guanghan green
  ledges after 5 s of focus with three crack stages. Soft River logs break after 5 s
  of standing. Map: [docs/editor/destructibility.md](docs/editor/destructibility.md).
- Story map editor Copy duplicates the selection (platforms, walls, items, critters,
  hedges, water, Moon Pools) and offsets it by 40 px. Spawn and exit stay unique.
- Han's mooncakes spawn on the top-center of remaining green platforms. Resize or delete
  a ledge and the next cake follows that center. Walls and the wide floor are skipped.
- Han's lunar beam stops on platforms and walls. Mei can duck behind them. The impact
  leaves a scorch trail and a spark on the surface.
- Playfield HUD is `position: fixed` on the canvas bounds, not a child of the letterboxed
  `#app` parent, so Mei hearts stay top-left of the water and Han hearts stay top-center.
- Guanghan Han stamp is a helmeted mist with a half-moon standard and clearer growth when
  spirit hearts drop. The lunar beam is a tracking slab that starts shortly after stage 2.
- Dying as Mei on Guanghan restarts the station (Han hearts included). Retry on the tumble
  card does the same.
- Playfield HUD no longer writes CSS `inset` after canvas sync, which had cleared top and
  left and clipped Mei hearts, the ticker, and Han hearts off the letterboxed canvas.
- Guanghan Han uses an armored mist stamp (`story_han`) with a helmet half-moon. Asset
  Workshop Creatures can paint that key. Rage skins stay darker copies. He is not a
  map-editor wildlife token.
- Han speaks four ticker lines (full health, 3 hearts, 1 heart, beaten) on the Moon Pool
  HUD. Roam speed steps by stage (96 / 168 / 248). From 3 hearts he may charge a tracking
  lunar beam (2 s then 4 s, 1 s charge at 1 heart, 10 s cooldown, 2 hearts on contact).
  Frost and star fans keep their old timing. On the last hit he spirals inward at his last
  position and a moon grows outward there before the exit opens.
- Playfield HUD (`mountPlayfieldHud`) sizes to the FIT canvas rect, so Mei hearts sit on
  the water instead of the green letterbox gutter.
- Story wildlife and pickups share canvas stamps (`src/render/stamps.ts`) with Asset
  Workshop. Fox, hedgehog, squirrel, frog, cat, owl, goat, boar, tortoise, bees, heron,
  crow, magpie, wisp, and ice have dedicated silhouettes. Items use carrot, mooncake,
  blossom, and lantern stamps instead of tinted carrots.
- Dash particles match the named dash: outlined grass motes, small carrots, gale commas,
  and full small moons. A trail emits about every 28 ms while Mei is dashing. Reduced
  motion skips the stream. Afterimages stay.
- Burrow exit and Moon Pool win/checkpoint on contact with the visible ellipse. The extra
  proximity box around the hole is gone. Moon Pool awakens on first touch (silver
  reflection, no pause, no DialogueOverlay). Chang'e's line runs in a HUD ticker at the
  top center of the playfield. Trigger map: `docs/story/proximity.md`.
- Story ticker, Mei hearts, and boss hearts sit on the playfield overlay
  (`mountPlayfieldHud`). Header and pause stay as chrome. Editor top chrome docks under
  that chrome (`placeBelowStoryChrome`).
- Stations may hold several Moon Pools. Delete and Environment place work in the editor.
  Each pool has its own Chang'e line. First contact on that puddle awakens it and sets
  the checkpoint. Spawn and burrow exit stay undeletable.
- Asset Workshop uses tabs for Dash look, Props, Creatures, and Items. Creature and item
  brushes save per-id overlays (`story_critter_*`, `story_item_*`) so a fox paint does not
  recolor every wildlife stamp.
- Floating move/jump/dash intro is Soft Paws only. Other stations keep the chips docked
  in the top bar.
- Burrow win uses the inner hole ellipse, not the dirt rim.
- Cart Chase plants a finish flag before the burrow. If Fox Hu's cart reaches it first,
  the station retries from the start.
- Customize preview is still by default. Stop animations starts on. Play cycles bound
  clips at random (dash today).
- Settings map editor card is Open only. World and station switching live in the
  editor. Environment and Creatures are white select bars grouped by world.
  Selection Mode Region drag-selects every object in a rectangle, with shared
  fields. Build-mode critters stay selectable (no gravity/AI). Map editor tools sit
  in one compact bar above the playfield. Play / Build / Set active stay on the
  bottom bar. Night overlay can darken Burrow Eve independently of hour. Look also
  edits far, fog, day haze, night amount, and low gravity.
- Story and Endless letterbox the Phaser canvas between HUD chrome (and the map-editor dock)
  so fullscreen FIT no longer stretches under the bars. Camera zoom is 1.

### Fixed

- Cart Chase Fox Hu and other grounded creatures no longer fall through the floor on
  map start. `constrainCreatureToWorld` seats them after physics-group add.

### Added

- Dash cosmetic on Customize next to fur, ears, and accessory (`meadow`, `carrot`, `gale`,
  `moon`). Looks are visual only (stretch, afterimages, particles) and unlock with
  achievements. `WORLD4_CLEAR` on Closing Gale. Story map editor Phase A slice: selectable
  hedges, palette/weather/water/sky, meadow-native critters. Dash look editor and asset
  workshop on the Asset Workshop page from Settings. Local Vite write-back to `src/data`
  while `npm run dev` is running. Editor contract: `docs/editor/README.md`.

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
