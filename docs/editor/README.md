# Story editor

Settings-gated, removable. Flag `contentFlags.storyMapEditor`. Code: `src/modes/story/editor/`. Settings keeps a compact Story map editor card next to an Asset Workshop card. Dash look and silhouette brushes live in the AssetWorkshop scene (`src/scenes/AssetWorkshopScene.ts`). Workshop code is `contentFlags.assetWorkshop` and `src/fx/workshop/`.

Family tone: fail is retry. Off-limits as HP bars: Chang'e, Yue, Yutu, Wu Gang, moon toad, Crane Envoy, Fox Hu.

## Overlay vs repo

**Set active does not write the repo.** GitHub Pages cannot touch `src/data`. It only overwrites the **browser** copy.

| What | Key |
| --- | --- |
| Maps | `bunnymeadow.editor.overlay.v1` |
| Dash looks | `bunnymeadow.dash.overlay.v1` |
| Workshop textures | `bunnymeadow.workshop.overlay.v1` |

World Map / play on **that browser** uses the overlay. Other machines and a fresh browser use shipped JSON.

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

Build bar: Platform, Wall, Bridge, Critter, Item, Hedge, Water, Grass, Lantern.

Wall is the green collision slab. Hedge/vine art is a separate selectable decor object (`overlay.decor`). Water is a first-class hazard (`overlay.hazards`) with current.

Inspector: x, y, w, h, rotation, asset (ground, hedge, bridge, log, pool, exit), plus station look (palette kit, sky hex, hour, weather, night overlay, lantern glow).

Native critter pickers: `src/modes/story/editor/roster.ts`. Soft Paws / meadow native is fox, hedgehog, crow, carrot. Bees and tortoise stay in All until their idea pages ship as live data.

## Phases

### A — Select every object and station look

Hedge art selectable. Palette / weather / water / sky in the inspector. Map width stays. Lighting stays palette tokens.

### B — What already lives on the path

Native pickers follow [WORLDS.md](../WORLDS.md) and [creatures/README.md](../creatures/README.md). Do not dump Cloud Stair onto Soft Paws. Idea-row beings (bees, tortoise, boar, carp, dew) stay unlabeled in native lists until a wildlife page is live in `enemies.json` / `items.json`.

### C — New beings only with lore

New creature = LORE note + biome wildlife page + archetype (patrol, chaser, lob, reach, diver, swarm, blocker). Invented folk only if the painting has an empty job. A stair lantern-keeper is plausible. A second moon boss is not.

### D — Asset workshop

Own scene from Settings. Silhouette brushes start from a visible seed stamp. Palette tokens, PNG export, localStorage overlay applied on the next `ensureStoryTextures` call. Dash look preview is the same page. Not a 3D modeller.

### E — Repo write-back (local only)

Optional Vite POST while developing. Pages keeps overlay + Copy JSON forever.

## Removal

Set `storyMapEditor` / `assetWorkshop` false. Delete `src/modes/story/editor/`, `src/fx/workshop/`, and `src/scenes/AssetWorkshopScene.ts` plus the Settings hooks.
