# Bunny Meadow — Implementation Roadmap

Sequencing and build contracts. Design lives in [GDD.md](GDD.md), [STORY.md](STORY.md), [WORLDS.md](WORLDS.md), [ENEMIES.md](ENEMIES.md), [UI.md](UI.md), [STEAM.md](STEAM.md), [LORE.md](LORE.md).

## North star

Four modes (Meadow, Story, Moon Tasks, Endless) share one save schema, one input action map, one difficulty/enemy data layer, and one `ModeContext`. Menus and overlays are HTML/CSS for crisp text. Playfields are Phaser at 1920x1080 with `Scale.FIT`. Desktop/Steam plugs in through `core/platform` without gameplay touching `localStorage` or Electron APIs. M1 ships only Meadow as playable, but registers and stubs every later surface so M2–M8 fill stubs instead of inventing parallel systems.

## Done (M0 + M1)

- Phaser 4 + Vite + TypeScript scaffold
- Meadow arcade port (`MeadowRuntime` / `MeadowScene`)
- `core/platform` web implementation (`SaveStore`, Achievements, Window, Presence)
- Design docs and Pages npm build
- Crisp HTML Title shell
- M1 meta shell: DomShell, Mode Select, Settings, Customize, Credits
- Save/session, difficulty, input (incl. jump), audio/i18n buses, contentFlags
- Stub routes: WorldMap, Story, TaskSelect, TaskRun, Endless, Pause, DialogueOverlay, Result
- Stub modules: Spawner, ChunkAssembler, TaskRunner shell
- Meadow applies difficulty, accessibility, bindings, pantry persist

## Frozen contracts

Later milestones must not invent a second version of these. M1 creates them (filled or stubbed). M2+ replaces stub bodies only.

### Scene registry

| Key | Kind | M1 state |
| --- | --- | --- |
| Boot | system | live |
| Preload | system | live (also loads active save) |
| Title | menu HTML | live splash |
| ModeSelect | menu HTML | live hub |
| Settings | menu HTML | live |
| Customize | menu HTML | live |
| Credits | menu HTML | live (includes achievements list) |
| Meadow | play | live |
| WorldMap | menu HTML | stub card (“path continues later”) |
| Story | play | stub scene |
| TaskSelect | menu HTML | stub card |
| TaskRun | play | stub (runner shell exists, no tasks) |
| Endless | play | stub scene |
| Pause | overlay HTML | shared; Meadow uses it |
| DialogueOverlay | overlay HTML | stub API, no lines |
| Result | menu HTML | stub shell for post-level |

Missing routes are forbidden. Locked or unfinished modes still navigate to a stub screen.

### Content flags

`src/data/contentFlags.json` (or equivalent in `core/contentFlags.ts`):

| Flag | Meaning | Default (web) |
| --- | --- | --- |
| `meadow` | Meadow playable | true |
| `tasks` | Moon Tasks selectable | false until M2 |
| `storyWorld1` | Story W1 on web | false until M3 |
| `storyFull` | Worlds 2–3 + finale | false (Steam / later) |
| `endless` | Endless selectable | false until M5 |
| `webFullStory` | Override to ship full story on web | false (confirm before M7) |

Mode Select reads flags. It never hard-codes “delete Story for Steam”.

### Save v1

Single schema in [UI.md](UI.md). Keys: `bunnymeadow.save.0..2`, `bunnymeadow.settings` (active slot).

Fields M3–M5 fill that must exist from M1:

- `progress.story` (`world`, `level`, `cleared`, `checkpoints`)
- `progress.tasksCompleted`
- `progress.endlessBest`
- `progress.pantryLevel` / `pantryCarrots` / `meadowMapsUnlocked`
- `progress.achievements`
- `settings.bindings` (includes `jump`)
- `settings.audio`, `settings.language`, `settings.accessibility`, `settings.difficulty`

Rules: one `migrateSave`. No parallel stores. Never write without migrating first. Sync achievement ids with `platform.achievements`.

### Input actions

| Action | Meadow | Story | Tasks | Endless |
| --- | --- | --- | --- | --- |
| `move` | used | used | used | used |
| `dash` | used | used | used | used |
| `jump` | no-op | used | mode-dependent | used |
| `pause` | used | used | used | used |
| `confirm` | menus / overlay | menus | menus | menus |
| `cancel` | menus | menus | menus | menus |

Keyboard and gamepad maps share these action names from M1. Story must not invent a second binding system.

### Mode module layout

```
src/modes/meadow/
src/modes/story/
src/modes/tasks/
src/modes/endless/
```

Shared `ModeContext`: active save, difficulty resolver, input, audio bus, `t()`, spawner, content flags.

### Systems stubs (M1 empty modules)

| Module | Filled in |
| --- | --- |
| `systems/Spawner.ts` | M2 (reads `enemies.json`) |
| `systems/ChunkAssembler.ts` | M3 (Story + Endless chunks) |
| `modes/tasks/TaskRunner.ts` | M1 shell; task bodies M2+ |
| `scenes/DialogueOverlay.ts` | M3 |
| `core/audio.ts` | M1 volume bus; assets M5 |
| `core/i18n.ts` | M1 `t(key)` + EN/DE/ZH-Hans files; full copy M5 |
| `core/platform/desktop.ts` | M6 |

### Difficulty API

`getDifficulty(save)` returns merged preset + overrides from `difficulty.json`. Every mode uses this. Meadow applies hearts, fox speed, detection, dash cooldown, invuln, and a11y in M1 (not deferred to M2).

### HUD contract

Shared component ids (hearts, carrots, dash, objective, timer) for HTML or Phaser-agnostic helpers. Story reuses the contract; Meadow keeps its bar layout as one consumer.

### Platform APIs desktop must honor (from M1)

See [STEAM.md](STEAM.md). Web already implements: `SaveStore`, `Achievements`, `Window` (fullscreen/quit), `Presence`. M6 only swaps the backend.

## Milestones

### M1 — Meta shell + full stub surface

**Status: done**

**Goal:** Hub, settings, save, and every later route exists. Only Meadow plays.

**Must exist after**

- DomShell + shared menu CSS
- Title → Mode Select → Meadow; Back from Meadow → Mode Select
- Settings, Customize, Credits (achievements list)
- Save/session/migrate; pantry carrots on Meadow win
- Difficulty + accessibility applied in Meadow
- Input: keyboard + gamepad for `move` / `dash` / `jump` / `pause` / `confirm` / `cancel`
- `core/audio.ts` volume bus (no assets)
- `core/i18n.ts` with keys for menus
- `contentFlags` driving Mode Select locks
- Stub scenes: WorldMap, Story, TaskSelect, TaskRun, Endless, DialogueOverlay, Result
- Stub modules: Spawner, ChunkAssembler, TaskRunner shell

**Must stay stub**

- No Story physics, no real maps beyond current Meadow, no task gameplay, no Endless runner, no dialogue lines, no audio files

**Exit criteria**

- Reload keeps difficulty, cosmetics, slot, language, bindings
- Mode Select is the hub; unfinished modes open stub screens (not 404 / missing scenes)
- Gamepad can navigate menus and play Meadow
- Menus stay crisp HTML

**Later milestones must not reinvent:** save schema, input actions, scene keys, ModeContext, DomShell, contentFlags, audio/i18n module paths.

### M2 — Meadow expansion + first Moon Tasks

**Goal:** Data-driven Meadow maps and enemies; two tasks on the M1 TaskRunner.

**Fills**

- Meadow map JSON + three extra maps ([WORLDS.md](WORLDS.md))
- Archetypes via Spawner: patrol, chaser, ranged_lob, reach ([ENEMIES.md](ENEMIES.md))
- Pantry gates for maps / cosmetics (enforce unlock function from M1)
- Carrot Rush + Hide and Seek on TaskRunner
- Set `contentFlags.tasks` true

**Must not reinvent:** TaskRunner entrypoint, difficulty API, enemy JSON schema.

**Exit criteria:** second Meadow map playable; both tasks completable; pantry unlock changes Customize/Mode Select.

### M3 — Story vertical slice

**Goal:** World 1 playable through Fox Hu cart chase.

**Fills**

- ChunkAssembler + Tiled/chunk path
- Story physics: run, jump, dash, wall bounce
- Moon Pools writing `progress.story.checkpoints`
- DialogueOverlay (two-line rule, [LORE.md](LORE.md) check)
- Levels 1-1 … 1-3 per [WORLDS.md](WORLDS.md) / [STORY.md](STORY.md)
- Set `contentFlags.storyWorld1` true

**Must not reinvent:** `jump` bindings, DialogueOverlay mount pattern, save story fields.

**Exit criteria:** clear W1; Moon Pool reload restores checkpoint; Fox Hu chase unlocks `FOX_FOILED`.

### M4 — Story content complete

**Goal:** Worlds 2–3, bosses, moon finale, epilogue.

**Fills:** remaining levels, Heron Fisher, Crane Envoy, Guanghan finale, epilogue. Start Steamworks verification in parallel ([STEAM.md](STEAM.md)). Optionally set `storyFull` for desktop builds only.

**Must not reinvent:** WorldMap route, boss-as-phases-in-enemies-data pattern.

**Exit criteria:** full story clearable; `MOON_RETURN` unlocks.

### M5 — Endless, audio assets, i18n fill, polish

**Goal:** Endless on ChunkAssembler; shippable feel on web.

**Fills:** EndlessScene body; music/sfx hooked to audio bus; DE/ZH-Hans string fill; polish. Set `contentFlags.endless` true.

**Must not reinvent:** ChunkAssembler, audio bus API, i18n `t()`.

**Exit criteria:** Endless distance saves to `endlessBest`; language switch updates menus; `ENDLESS_1K` possible.

### M6 — Desktop shell

**Goal:** Electron + steamworks.js; `desktop.ts` behind existing platform interface.

**Fills:** [desktop/](../desktop/) main/preload/builder; file saves; achievement activate; fullscreen/quit; CI matrix win/mac/linux.

**Must not reinvent:** platform interface methods listed in STEAM.md.

**Exit criteria:** clean-machine launch; overlay works on Windows; achievements toast.

### M7 — Steam presence

**Goal:** Store page and demo without rewriting Mode Select.

**Fills:** capsules, trailer, Coming Soon (≥2 weeks), demo app id (World 1), Next Fest entry. Confirm `webFullStory` / content split.

**Exit criteria:** public Coming Soon; demo installs; wishlist tracking in place.

### M8 — Release

**Goal:** SteamPipe depots, Valve review, wishlist go/no-go, launch, patch window.

## Working rules

- Menus and overlays: HTML/CSS only (no Phaser Text for chrome)
- Gameplay: Phaser, 1920x1080, `Scale.FIT`
- Data before code for enemies, maps, difficulty, content flags
- No second save format or second input action enum
- No folklore name without a [LORE.md](LORE.md) status
- Ship to Pages after each milestone that changes the playable web build
- Stub screens beat missing scenes

## Suggested next coding session

Implement M2: Meadow map JSON, Spawner archetypes, TaskRunner bodies (Carrot Rush + Hide and Seek), pantry gates, set `contentFlags.tasks` true.
