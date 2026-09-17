# Bunny Meadow — UI and Save

Screen list and save schema must match [ROADMAP.md](ROADMAP.md) frozen contracts. Menus are HTML. Playfields are Phaser.

## Screen flow

```
Boot -> Preload -> Title
  Title -> Mode Select
  Title -> Settings
  Title -> Customize
  Title -> Achievements
Mode Select -> Meadow | World Map | Task Select | Endless
World Map -> expand world -> Story level or W0 lore/controls beat -> World Map
Task Select -> Task Run -> Task Select
Endless -> Result -> Mode Select
Any play -> Pause (inline in Meadow/Tasks today; shared Pause scene stub) -> Resume | Settings | Quit
DialogueOverlay can sit above Story or Meadow
StoryBeat panel sits above WorldMap for World 0 stations
```

### Scene registry (all real routes)

| Key | Role | Notes |
| --- | --- | --- |
| Boot | system | |
| Preload | system | loads active save |
| Title | menu | splash |
| ModeSelect | menu | hub; reads contentFlags |
| Settings | menu | Story map editor card. Asset Workshop card opens AssetWorkshop. |
| Customize | menu | |
| Achievements | menu | live (achievement list + short project credit) |
| Meadow | play | live (data-driven arcade, M2; entered from Moon Tasks) |
| WorldMap | menu | live (burrow-to-moon path; W0–W4 + moon) |
| Story | play | live (full story side-scroll through Guanghan) |
| TaskSelect | menu | live (M2: Night Watch, Hide and Seek) |
| TaskRun | play | live (M2 TaskRuntime) |
| Endless | play | live (M5: chunk-streamed runner, chase wall, local leaderboard) |
| Pause | overlay | stub registered; Meadow/Tasks use inline pause until shared Pause lands |
| DialogueOverlay | overlay | live (Moon Pool / two-line) |
| Result | menu | stub shell until modes need it |
| AssetWorkshop | menu | Dash look + silhouette brush. Opened from Settings. |

Missing scenes are forbidden. Unfinished modes open their stub screen.

## HUD components (shared)

| Component | Shows |
| --- | --- |
| Hearts | Current hearts |
| Carrots | Count / goal |
| Dash | Ready or cooldown |
| Objective | One short line |
| Timer | Tasks and speedruns |
| Item tray | Top-right icon plus remaining seconds for every timed buff |
| Boss hearts | Guanghan: Han's five spirit hearts, top center |
| Mute | Story bar, left of Pause. Toggles master output. Stored as `settings.audio.muted` |

Modes compose the same components. Meadow keeps its bar layout as one consumer. Story and others reuse the contract. The item tray is `src/ui/ItemTray.ts`. Story shows mooncake warmth on Guanghan. Endless shows lantern glow. Instant effects (heal, pantry carrot, extra glide charge) do not take a slot.

Story and Endless keep the Phaser canvas inside a letterbox between the HTML bars (`src/ui/playfieldFrame.ts`). Fullscreen still uses `Scale.FIT` at 1920x1080, but the parent is inset so HUD and the map-editor dock do not cover the playfield. Camera zoom on those modes is 1.

## Settings

- Audio: master, music, sfx (bus from M1; assets from M5)
- Key remap for actions below
- Gamepad remap (first-class from M1)
- Touch layout
- Difficulty preset + per-parameter overrides
- Accessibility toggles (see [GDD.md](GDD.md))
- Language: EN, DE, ZH-Hans (`t(key)` from M1)
- Fullscreen and resolution (desktop)
- Story map editor (`contentFlags.storyMapEditor`, default on). Compact card on Settings next to Asset Workshop. Lists every playable Story station from `listStoryLevels()` (Soft Paws, Worlds 1-4, Guanghan). Meadow and Endless stay out. **Play** opens Story with fail-off (no retry overlay from falls, water, gale, or empty hearts). **Build** drags platforms, walls, bridges, hedges, water, grass, lanterns, critters, items, spawn, Moon Pool, and exit (snap 10 px) with an inspector (rotation, asset, palette, weather, sky). **Undo** restores the selected object to the first snapshot taken when it was selected. All drags and field edits on that object collapse into one restore. **Set active** writes the overlay so World Map Story on this browser uses it in place of the shipped JSON. GitHub Pages cannot write `src/data`. **Copy JSON** downloads a bundle to paste into `src/data/story/` and `src/data/chunks/`. Local `npm run dev` may also POST that bundle to `src/data/editor-out/`. **Map width** extends the station. Critter and item pickers list wildlife and live pickups native to the biome, plus the rest of the roster. Meadow native is fox, hedgehog, crow, carrot. **Clear overlay** drops local edits for that id. Persistence is `localStorage` key `bunnymeadow.editor.overlay.v1`, not SaveV1. Editor sessions do not write `cleared`, pantry, or achievements.
- Asset Workshop scene (`contentFlags.assetWorkshop` plus the map-editor flag for dash look). Opened from the Settings card beside Story map editor. Dash look (`bunnymeadow.dash.overlay.v1`) and silhouette brushes (`bunnymeadow.workshop.overlay.v1`) live there. Remove later by setting the flags false or deleting `src/modes/story/editor/`, `src/fx/workshop/`, `src/scenes/AssetWorkshopScene.ts`, plus the Settings and Story hooks. Expansion contract: [editor/README.md](editor/README.md).

## Input actions (bindings)

All modes share these action names. Stored under `settings.bindings`.

| Action | Default keyboard (seed) | Notes |
| --- | --- | --- |
| `move` | WASD + arrows | vector |
| `dash` | KeyR | |
| `jump` | Space | no-op in Meadow; required for Story |
| `pause` | KeyP | |
| `confirm` | Enter / South face | menus |
| `cancel` | Escape / East face | menus |

Gamepad: left stick / d-pad for move; South dash or confirm by context; West or LB jump; Start pause. Exact indices live in the bindings object and Settings remap UI.

## Customize

Unlocked by pantry level. Cosmetics only. Unlock helpers exist from M1. Map unlocks are enforced for Meadow. Cosmetic option filtering in Customize UI is still open.

| Slot | Options (seed) | Unlock |
| --- | --- | --- |
| Name | free text, default Mei | always |
| Fur | cream, brown, gray, moon-white | pantry 1+ |
| Ears | upright, lop, tufted | pantry 2+ |
| Accessory | none, scarf, lantern, blossom | pantry 3+ |
| Dash | meadow (always), carrot (`BASKET_FULL`), gale (`WORLD4_CLEAR`), moon (`MOON_RETURN`) | achievement |

## Save schema v1

Three slots behind `SaveStore` (`core/platform`). Web: `localStorage`. Desktop: JSON files under Electron `userData` for Steam Auto-Cloud.

```json
{
  "version": 1,
  "slot": 0,
  "updatedAt": "2026-09-15T00:00:00.000Z",
  "player": {
    "name": "Mei",
    "fur": "cream",
    "ears": "upright",
    "accessory": "none"
  },
  "settings": {
    "difficulty": "hopper",
    "difficultyOverrides": {},
    "accessibility": {
      "invincible": false,
      "slowTime": false,
      "autoDash": false,
      "highContrast": false,
      "reducedMotion": false,
      "largerText": false,
      "oneButtonTouch": false
    },
    "audio": { "master": 1, "music": 0.8, "sfx": 1 },
    "language": "en",
    "bindings": {
      "moveUp": ["KeyW", "ArrowUp"],
      "moveDown": ["KeyS", "ArrowDown"],
      "moveLeft": ["KeyA", "ArrowLeft"],
      "moveRight": ["KeyD", "ArrowRight"],
      "dash": ["KeyR"],
      "jump": ["Space"],
      "pause": ["KeyP"],
      "confirm": ["Enter"],
      "cancel": ["Escape"]
    }
  },
  "progress": {
    "pantryLevel": 1,
    "pantryCarrots": 0,
    "meadowMapsUnlocked": ["meadow_home"],
    "story": {
      "world": 1,
      "level": 1,
      "cleared": [],
      "checkpoints": {},
      "controlHints": []
    },
    "tasksCompleted": [],
    "endlessBest": 0,
    "achievements": []
  }
}
```

Migration: `migrateSave(raw) -> SaveV1`. Bump `version` and add a branch per old version. Never write without migrating first. Never add a parallel store for story/tasks/endless.

`progress.story.cleared` holds World 0 station ids (`w0_setting`, `w0_lore_moon`, `w0_controls`) and level ids (`w1_1_soft_paths`, …). Saves that already cleared any `w1_*` level auto-gain the three W0 stations on migrate. Positional checkpoints are not persisted.

World Map: SVG ink-brush path with expand/collapse world nodes. One world rail open at a time. W0 stations open a DomShell beat panel. Level stations start Story. Badges show cleared/total per world (3/3 when bosses are done; moon when unlocked).

Fields reserved for later milestones (must exist from M1): `progress.story.*`, `tasksCompleted`, `endlessBest`. M5 adds `progress.endlessRuns` (per-difficulty top-10 `{ name, distance, seed, date }`), sanitized in `migrateSave`.

## Storage keys (web)

- `bunnymeadow.save.0` … `bunnymeadow.save.2`
- `bunnymeadow.settings` (last used slot index and global prefs mirror)
