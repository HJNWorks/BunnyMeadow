# Bunny Meadow — Implementation Roadmap

Sequencing and build contracts. Design lives in [GDD.md](GDD.md), [STORY.md](STORY.md), [WORLDS.md](WORLDS.md), [ENEMIES.md](ENEMIES.md), [UI.md](UI.md), [STEAM.md](STEAM.md), [LORE.md](LORE.md).

## North star

Four modes (Meadow, Story, Moon Tasks, Endless) share one save schema, one input action map, one difficulty/enemy data layer, and one `ModeContext`. Menus and overlays are HTML/CSS for crisp text. Playfields target Phaser at 1920x1080 with `Scale.FIT`. Desktop/Steam plugs in through `core/platform` without gameplay touching `localStorage` or Electron APIs.

Web playable after M2: **Meadow** and **Moon Tasks** (Night Watch + Hide and Seek). Full Story ships on web after M4 (`storyFull` / `webFullStory`). Endless remains flag-gated until M5. Every later surface was registered in M1 so milestones replace stub bodies instead of inventing parallel systems.

## Status snapshot

| Milestone | Status |
| --- | --- |
| M0 scaffold + first Meadow port | done |
| M1 meta shell + stub surface | done |
| M2 Meadow arcade expansion | done |
| M2 Moon Tasks (Night Watch + Hide and Seek) | done |
| M3 Story World 1 vertical slice | done |
| M4 Story content complete | done |
| M5–M8 | not started; next = M5 Endless / audio / i18n |

## Done

### M0 + M1 — scaffold and meta shell

- Phaser 4 + Vite + TypeScript scaffold; Pages npm build
- First Meadow arcade port (`MeadowRuntime` / `MeadowScene`)
- `core/platform` web implementation (`SaveStore`, Achievements, Window, Presence)
- Design docs; DomShell; Title; Mode Select; Settings; Customize; Achievements
- Save/session/migrate; difficulty API; input (incl. `jump`); audio/i18n buses; contentFlags
- Full scene registry created (later surfaces as stubs at M1 close)
- Stub modules at M1 close: Spawner, ChunkAssembler, TaskRunner (filled or partially filled in M2; see below)

### M2 Meadow track — arcade expansion

- Shared `drawBunny` cosmetics (Customize preview + Meadow)
- Difficulty presets incl. Hardcore; `carrotGoal`, `timerSeconds`, `enemyIds` / `enemyCount`, `itemChance`
- Four map JSON files + pre-run lobby (map + difficulty chips) + pantry map unlocks
- Spawner archetypes: chaser / patrol / ranged_lob; leaf / dew pickups
- Inline pause (Resume / Settings return / Quit); post-run replay + lobby return
- HUD: map name, carrot goal, optional timer

### M2 Tasks track — Moon Tasks

- Playable: Night Watch (survive waves until dawn) + Hide and Seek (find kits)
- Carrot Rush retired (same loop as Meadow collect); id may remain typed for save compat
- `tasks.json` + TaskRunner; TaskSelect / TaskRun / TaskRuntime on Meadow canvas stack
- `contentFlags.tasks` true; Mode Select gated; `tasksCompleted` + pantry on win

## Frozen contracts

Later milestones must not invent a second version of these. M1 created them (filled or stubbed). Later milestones replace stub bodies only.

### Scene registry

| Key | Kind | State |
| --- | --- | --- |
| Boot | system | live |
| Preload | system | live (also loads active save) |
| Title | menu HTML | live splash |
| ModeSelect | menu HTML | live hub |
| Settings | menu HTML | live |
| Customize | menu HTML | live |
| Achievements | menu HTML | live (achievement list + short project credit) |
| Meadow | play | live (data-driven arcade) |
| WorldMap | menu HTML | live (burrow-to-moon path; W0–W3 + moon) |
| Story | play | live (Phaser side-scroll full story) |
| TaskSelect | menu HTML | live (Night Watch, Hide and Seek) |
| TaskRun | play | live (canvas TaskRuntime) |
| Endless | play | stub scene |
| Pause | overlay HTML | registered stub; Meadow and Tasks use inline pause cards (shared Pause scene unused) |
| DialogueOverlay | overlay HTML | live (two-line card; Moon Pool lines) |
| Result | menu HTML | stub shell for post-level |

Missing routes are forbidden. Locked or unfinished modes still navigate to a stub screen.

### Content flags

`src/data/contentFlags.json` (via `core/ModeContext.ts`):

| Flag | Meaning | Default (web) |
| --- | --- | --- |
| `meadow` | Meadow playable | true |
| `tasks` | Moon Tasks selectable | true |
| `storyWorld1` | Story W1 on web | true |
| `storyFull` | Worlds 2–3 + finale | true (web after M4) |
| `endless` | Endless selectable | false until M5 |
| `webFullStory` | Ship full story on web | true (M4) |

Mode Select reads flags. It never hard-codes “delete Story for Steam”.

### Save v1

Single schema in [UI.md](UI.md). Keys: `bunnymeadow.save.0..2`, `bunnymeadow.settings` (active slot).

Fields later milestones fill that must exist from M1:

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
| `jump` | no-op | used | no-op | used |
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

### Playfield architecture

| Mode family | Playfield | Notes |
| --- | --- | --- |
| Meadow, Moon Tasks | HTML chrome + canvas runtime | `MeadowRuntime` / `TaskRuntime`; share maps, Spawner, `drawBunny` |
| Story, Endless | Phaser side-scroll on chunks | M3+; must not clone MeadowRuntime for platforming |

### Systems fill schedule

| Module | Status |
| --- | --- |
| `systems/Spawner.ts` | Meadow + Tasks subset live (chaser / patrol / ranged_lob); reach + fuller Story usage later |
| `systems/ChunkAssembler.ts` | live for W1 JSON chunks |
| `modes/tasks/TaskRunner.ts` | live for Night Watch + Hide and Seek; other task ids typed but unregistered |
| `scenes/DialogueOverlay.ts` | live (two-line overlay) |
| `core/audio.ts` | volume bus; assets → M5 |
| `core/i18n.ts` | `t(key)` + EN/DE/ZH-Hans files; full copy → M5 |
| `core/platform/desktop.ts` | → M6 |

### Difficulty API

`getDifficulty(save)` returns merged preset + overrides from `difficulty.json`. Every mode uses this. Meadow and Tasks apply hearts, carrotGoal/timer or task-scaled params, enemyIds/enemyCount, itemChance where relevant, enemy speed, detection, dash cooldown, invuln, and a11y.

### HUD contract

Shared component ids (hearts, carrots, dash, objective, timer) for HTML or Phaser-agnostic helpers. Story reuses the contract; Meadow and Tasks keep bar layouts as consumers.

### Platform APIs desktop must honor (from M1)

See [STEAM.md](STEAM.md). Web already implements: `SaveStore`, `Achievements`, `Window` (fullscreen/quit), `Presence`. M6 only swaps the backend.

## Milestones

### M1 — Meta shell + full stub surface

**Status: done**

**Goal (historical):** Hub, settings, save, and every later route exists. Only Meadow played at M1 close.

**Exit criteria (met)**

- Reload keeps difficulty, cosmetics, slot, language, bindings
- Mode Select is the hub; unfinished modes open stub screens
- Input actions wired for keyboard + gamepad
- Menus stay crisp HTML

**Note:** Real Meadow maps and Moon Tasks shipped in M2 (see Done).

**Later milestones must not reinvent:** save schema, input actions, scene keys, ModeContext, DomShell, contentFlags, audio/i18n module paths.

### M2 — Meadow expansion + first Moon Tasks

**Status: done** (both tracks). Inventory lives under Done above.

#### M2 Meadow track

**Exit criteria (met):** second Meadow map playable; pantry unlocks maps; cosmetics visible in-run.

#### M2 Tasks track

**Exit criteria (met):** Night Watch and Hide and Seek completable from Mode Select; progress persists; `tasks` flag enabled on web.

**Deferred within M2 (still open, not blocking M3):** Spawner `reach` archetype, Lantern Run / Daily Moon, cosmetic option filtering in Customize UI.

### M3 — Story vertical slice

**Status: done**

**Filled:** Achievements rename (Title); WorldMap path map (W0 stations + W1–W3 expandable) + Story Phaser Arcade; ChunkAssembler JSON chunks with movers/hazards; Moon Pool checkpoints + DialogueOverlay; Soft Paths, Hedge Maze, Green Corridor, Floating Logs, Paper Lights, Tiger Road live; boss nodes Soon; `storyWorld1` true.

**Exit criteria (met for non-boss slice):** clear six playable stations; Moon Pool checkpoint restore; W0 beats unlock Soft Paths; W1 2/2 unlocks W2; W2 2/2 unlocks W3.

### M4 — Story content complete

**Status: done**

**Filled:** Cart Chase (Fox Hu race + dash tip), Raft Gauntlet (Heron Fisher 3 dash hits), Crane Summit (dive telegraph + bow exit), Guanghan low-gravity + DomShell epilogue; path unlocks after each world boss then moon; `FOX_FOILED` / `WORLD*_CLEAR` / `CRANE_FRIEND` / `MOON_RETURN`; `storyFull` + `webFullStory` true. Steamworks registration remains a parallel human track ([STEAM.md](STEAM.md)).

**Exit criteria (met):** full story clearable; `MOON_RETURN` unlocks on Guanghan clear.

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
- Gameplay: Phaser scale target 1920x1080, `Scale.FIT` (Meadow/Tasks currently canvas inside HTML chrome)
- Data before code for enemies, maps, difficulty, content flags
- No second save format or second input action enum
- No folklore name without a [LORE.md](LORE.md) status
- Ship to Pages after each milestone that changes the playable web build
- Stub screens beat missing scenes

## Suggested next coding session

Full story path is clearable through Guanghan. Next: Endless on ChunkAssembler, audio assets, i18n fill (M5). Steamworks registration stays parallel.
