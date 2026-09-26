# Story editor

Settings-gated, removable. Flag `contentFlags.storyMapEditor`. Code: `src/modes/story/editor/`. Settings keeps a compact Story map editor card next to an Asset Workshop card. Dash look and silhouette brushes live in the AssetWorkshop scene (`src/scenes/AssetWorkshopScene.ts`), with tabs for Dash look, Props, Creatures, and Items. Workshop code is `contentFlags.assetWorkshop` and `src/fx/workshop/`.

Family tone: fail is retry. Off-limits as HP bars: Chang'e, Yue, Yutu, Wu Gang, moon toad, Crane Envoy, Fox Hu, Xiwangmu.

## Overlay vs repo

**Set active does not write the repo.** GitHub Pages cannot touch `src/data`. It only overwrites the **browser** copy.

| What | Key |
| --- | --- |
| Maps | `bunnymeadow.editor.overlay.v2` |
| Dash looks | `bunnymeadow.dash.overlay.v1` |
| Workshop textures | `bunnymeadow.workshop.overlay.v1` |

World Map / play on **that browser** uses the overlay. Other machines and a fresh
browser use shipped JSON. An overlay is dropped when the shipped station width or
chunk list no longer matches (so a lengthened Guanghan is not replaced by an old
Set active copy). Clear overlay in the editor still drops a matching copy by hand.

To get a map **into the codebase**: Build → **Copy JSON** → open `{levelId}.editor.json` → paste `level` into `src/data/story/` and chunk keys into `src/data/chunks/`. Same pattern for dash JSON into `src/data/dashes.json`.

While `npm run dev` is running, Set active also POSTs to `/__bm/write` (Vite plugin in `vite.config.ts`). Maps land in `src/data/editor-out/{id}.editor.json`. Dash Set active may rewrite `src/data/dashes.json`. Pages builds do not include that plugin path as a live writer.

## Dash look spec

Shipped catalog: `src/data/dashes.json`. Equipped id is `player.equippedDash` on Customize. Locked ids fall back to `meadow`.

Fields (visual only, no physics):

| Field | Meaning |
| --- | --- |
| `id` | meadow, carrot, gale, moon |
| `unlockAchievement` | null or an achievements.json id |
| `tint` | afterimage tint |
| `stretchX` | width scale during dashTime |
| `afterimages` | 0–3 ghosts |
| `particle.shape` | speck, carrot, streak, crescent |
| `particle.count` / `life` / `spread` / `color` | burst behind Mei |

Reduced motion drops particles and afterimages. Dash duration, speed, and Han warmth stay in `playerController.ts`.

To add a shape: extend `DashParticleShape`, draw it in `src/fx/dash/canvasFx.ts` and a Phaser texture in `phaserFx.ts`, then pick it in the Asset Workshop dash look panel.

## Placeables

Build bar: Play, Build, Set active, Copy JSON, Back to Settings. World, station, Environment, and Creatures are white select bars. Selection and Look stay as panels. Settings only has Open.

A **Chapter** dropdown sits left of World in `src/modes/story/editor/BuildHud.ts`. Chapter 1 lists live worlds. Chapter 2 lists the six first stations. Chapter 3 stays empty. Hub: [../story/chapters.md](../story/chapters.md).

Object Addition: Environment and Creatures open as collapsible trees. Top level is Chapter 1, 2, and 3. Themes (Meadow, Cloud Stair, Guanghan, Outer Cold, …) sit inside the chapter. Creatures nest Path and Cloud Stair / Guanghan under Chapter 1, and Later under Chapter 3. Chapter 2 lists Mortar Yard (cassia grub) and Far Silver (Still Silver). Other Chapter 2 worlds stay empty until unique ids exist. Items are their own collapsed group. Each kind or wildlife id appears once. Placement still writes `env` (`platform@meadow`) so a meadow pad can sit on Guanghan. Stamp art uses that `env`, then the station kit for old JSON. Meadow through Cloud Stair share grass ground. Guanghan and Chapter 2 kits share lunar ground, plus rim, bowl, wound, and cave where those kinds exist. Chapter 3 stamps stay out. Folk stay out of the picker. Pestle sentry is listed once under Cloud Stair / Guanghan and still placeable on Chapter 2 maps. Inspect id lists group by chapter. The Mortar Yard kit adds two movers, Yard pestle (`kind: "pestle"`) and Cake round (`kind: "roller"`), and three decor kinds, Mortar, Roller trough, and Drying rack. The Far Silver kit adds Silver skin (platform `asset: "skin"` with the `silver` break and `regrow`) and the Dew-plate immortal decor. The Quiet Wells kit adds Dim lip (platform with `dim: true`, full strength in Build), Reflection lip, Stalactite, Well head, and Moon toad decor. The Cassia kit adds Bark cut (`kind: "bark"`, one slab per placement) and Heartwood decor. Healing bark is a `wound` pad with a `break` that has `regrow`. The Dust Sea kit adds Dust tide and Sinking dust (`hazards[]` kinds `tide` and `dust`, with `current`, `lift`, `period`, `phase`), Raft plank (`kind: "raft"`), and Crater and Raft mast decor. Dust hazards show as pale boxes in Build. The Outer Cold kit adds Guest screen (`kind: "screen"`), Chime stone (platform `asset: "chime"`), Ice, Moon door, and Chime frame. A gate is a screen, a moon door behind it, and a `hidden` wall lintel above it so the screen cannot be hopped ([../universe/environments/outer-cold.md](../universe/environments/outer-cold.md#mechanics)). Beat fields (`amplitude`, `speed`, `phase`) are JSON-only for now. Copy JSON keeps `phase`. Recipes: [../universe/environments/mortar-yard.md](../universe/environments/mortar-yard.md#mechanics).

Wall is the green collision slab. Hedge/vine art is a separate selectable decor object (`overlay.decor`). Water is a first-class hazard (`overlay.hazards`) with current. Burrow exit and Moon Pool are **contact** with the visible sprite. Water is a **volume**. Optional overlay field on decor and hazards:

```json
"trigger": { "kind": "proximity", "radius": 80 }
```

Runtime does not spawn a proximity sensor from that field yet. Do not put `trigger` on burrow or Moon Pool. Map: [story/proximity.md](../story/proximity.md). Destructible platforms, walls, logs, and decor use a `break` field. Profiles and damage sources: [destructibility.md](destructibility.md). Pad axes (collision, slide motion, surface): [../platforms/README.md](../platforms/README.md).
Cave roofs and false mouths: [../platforms/caves.md](../platforms/caves.md).

Toolbar: Selection Mode Object or Region. Region: drag a rectangle; every object inside is selected with its fields. Then x, y, w, h, rotation, asset, id, current, Destructible, Break profile, Undo, Copy, Delete apply to the set. Copy and Ctrl/Cmd+C store the selection in an in-memory clipboard (not spawn or exit). Ctrl/Cmd+V pastes at camera center, snap 10, keeping relative offsets. Ctrl/Cmd+D still duplicates in place and offsets 40 px. Backspace and Delete remove the selection (not spawn or exit). Shortcuts do not fire while an input, textarea, or select is focused. Look (palette kit, sky/far/fog hex, hour, weather, night overlay, night amount, day haze, lantern glow, low gravity, map width). Night overlay is independent of hour, so Burrow Eve afternoon can still darken. Catalog: `src/modes/story/editor/placeables.ts`, `roster.ts`, `worldIndex.ts`.

The editor top bar is `position: fixed` but its `top` is not a magic pixel. `placeBelowStoryChrome` in `src/ui/playfieldFrame.ts` sits it under `.meadow-bar` (title and pause row). Hearts, status ticker, and boss hearts live on the playfield via `mountPlayfieldHud`, not in that chrome. `watchStoryChrome` observes the chrome nodes, not the full-viewport root. Playfield inset runs `beforeMeasure` so the canvas follows. New editor bars must use the same helpers.

Native critter pickers: `src/modes/story/editor/roster.ts`. Chapter 1 nests Path (fox through goat, plus bees, tortoise, boar) and Cloud Stair / Guanghan. Do not debut dust mite, star wisp, or pestle sentry on Earth.

## Phases

### A — Select every object and station look

Hedge art selectable. Palette / weather / water / sky in the inspector. Map width stays. Lighting stays palette tokens.

### B — What already lives on the path

Native pickers follow [WORLDS.md](../WORLDS.md) and [creatures/README.md](../creatures/README.md). The Environment tree is not filtered by the open station. Bees, tortoise, and boar sit in Chapter 1 Path. Carp stays unlabeled until a water-patrol archetype ships. Dew is an item, not a wildlife picker.

### C — New beings only with lore

New creature = LORE note + biome wildlife page + archetype (patrol, chaser, lob, reach, diver, swarm, blocker). Invented folk only if the painting has an empty job. A stair lantern-keeper is plausible. A second moon boss is not.

### D — Asset workshop

Own scene from Settings. Segmented tabs: Dash look, Props, Creatures, Items. Silhouette brushes start from a visible seed stamp per texture id (`story_critter_*`, `story_item_*`, props). Creature and item stamps live in `src/render/stamps.ts` and are the same drawers Story bakes (`ensureStoryTextures` runs before the workshop binds). A fox kit uses `story_fox`, not a tinted Mei. Han is a Creatures-tab brush (`story_han`) only. He is not in the map-editor wildlife list. Items use carrot, mooncake, blossom, lantern, star grit, elixir crumb, and well silver stamps. Palette tokens, PNG export, localStorage overlay applied on the next `ensureStoryTextures` call. Not a 3D modeller. Tray chips still use CSS. Spawn and burrow exit stay undeletable. Moon Pools can be placed, deleted, and given a per-pool ticker line.

Dash particles keep the four shapes (`speck`, `carrot`, `streak`, `crescent`). Art is named after the dash: outlined grass motes, small carrots, gale wind commas, and full small moons. Burst still fires on dash start. While Mei is dashing, a stream emits about every 28 ms (Endless fox-ember cadence). Reduced motion skips the stream. Afterimages of Mei stay.

### E — Repo write-back (local only)

Optional Vite POST while developing. Pages keeps overlay + Copy JSON forever.

## Removal

Set `storyMapEditor` / `assetWorkshop` false. Delete `src/modes/story/editor/`, `src/fx/workshop/`, and `src/scenes/AssetWorkshopScene.ts` plus the Settings hooks.
