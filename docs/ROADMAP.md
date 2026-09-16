# Bunny Meadow — Implementation Roadmap

Sequencing and build contracts. Design lives in [GDD.md](GDD.md), [STORY.md](STORY.md), [WORLDS.md](WORLDS.md), [ENEMIES.md](ENEMIES.md), [UI.md](UI.md), [STEAM.md](STEAM.md), [LORE.md](LORE.md). The derived world model, bestiary, items, Endless detail and rendering language live under the [docs index](README.md). Ongoing web work is tracked as numbered iterations in [iterations/README.md](iterations/README.md).

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
| M5 Endless mode | done (audio assets + i18n fill still open) |
| Web iterations I1–I4 | I0 and I1 done. I2–I4 next (see [iterations/README.md](iterations/README.md)) |
| M6–M8 desktop + store | postponed to the end, after the web iterations |

## Current phase

Story milestones M0–M5 are done. The current focus is a run of web iterations (I1–I4)
that deepen the web build: seeded Endless routes, data-backed creatures and items, a
per-biome rendering language, then the remaining audio and i18n fill. The desktop and
store milestones (M6–M8) keep their numbers and sit at the end; they resume once the
web build is where it should be. See [iterations/README.md](iterations/README.md).

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
| Endless | play | live (chunk-streamed runner with chase wall) |
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
| `endless` | Endless selectable | true (M5) |
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

**Filled (Endless):** shared side-scroll kit extracted to `src/modes/story/shared/` (playerController, enemyKit, moversHazards, storyTextures) and reused by Story and Endless; endless chunk contract (`endless` metadata + `carrots`) on `ChunkDef`; glob-registered `src/data/chunks/endless/*.json` (35 tiered chunks) with `scripts/check-endless-chunks.mjs` in the build; seeded `EndlessGenerator` + `src/data/endless.json` (env schedule + per-difficulty chase/tier tuning); `EndlessScene` lobby (difficulty chips + local leaderboard), streaming segments, difficulty-scaled chase wall, hearts/respawn, lantern glide, carrots to pantry; `progress.endlessRuns` per preset in save/migrate; `contentFlags.endless` true.

**Still open:** music/sfx assets on the audio bus; DE/ZH-Hans string fill; broader polish.

**Must not reinvent:** ChunkAssembler, audio bus API, i18n `t()`.

**Exit criteria:** Endless distance saves to `endlessBest` (met); `ENDLESS_1K` at 1000 m (met); language switch updates menus (existing).

### Web iterations I1–I4 (current)

Detail per iteration in [iterations/README.md](iterations/README.md). These deepen the
web build before the desktop and store milestones resume.

| Iteration | Theme | Summary |
| --- | --- | --- |
| I0 | Repo hygiene | done: proprietary LICENSE, CONTRIBUTING, CHANGELOG, expanded README, CI on PRs, Conventional Commits (commitlint + husky), `v0.1.0` tag. |
| I1 | Biome route + shorter bands | done (unreleased): seeded route walker, `bandMeters`, tier jitter. Water and dusk can appear before 400 m. |
| I2 | Creatures + items in data | Chunk enemy/item slots; per-biome rosters and item tables; first non-carrot items. |
| I3 | Theme + rendering | palettes.json, sky lerp on bridge chunks, weather presets, cheap night lighting, layered mist wall. |
| I4 | Audio + i18n | Close the open M5 items: audio assets on the bus, DE/ZH-Hans fill. |

Each iteration can ship to Pages on its own. The version tag for this track waits until I4.

### M6 — Desktop shell

**Status: postponed** (resumes after web iterations I1–I4). Retained at the end of the
roadmap with its number unchanged. Electron transfer notes are in the section below.

**Goal:** Electron + steamworks.js; `desktop.ts` behind existing platform interface.

**Fills:** [desktop/](../desktop/) main/preload/builder; file saves; achievement activate; fullscreen/quit; CI matrix win/mac/linux.

**Must not reinvent:** platform interface methods listed in STEAM.md.

**Exit criteria:** clean-machine launch; overlay works on Windows; achievements toast.

### M7 — Steam presence

**Status: postponed** (resumes after M6). Retained at the end with its number unchanged.

**Goal:** Store page and demo without rewriting Mode Select.

**Fills:** capsules, trailer, Coming Soon (≥2 weeks), demo app id (World 1), Next Fest entry. Confirm `webFullStory` / content split.

**Exit criteria:** public Coming Soon; demo installs; wishlist tracking in place.

### M8 — Release

**Status: postponed** (resumes after M7). Retained at the end with its number unchanged.

**Goal:** SteamPipe depots, Valve review, wishlist go/no-go, launch, patch window.

## Electron transfer (what carries over)

The web build was designed so M6 swaps a backend, not the game. Full plan in [STEAM.md](STEAM.md).

**Transfers directly, unchanged:**

- All gameplay: Phaser scenes, modes, `systems/`, `entities/`, `render/`. They already run in a
  Chromium page; Electron is a Chromium page.
- The whole `src/` app loads from the same Vite build output (`dist/`). Electron points its
  `BrowserWindow` at that build.
- The platform interface (`core/platform/index.ts` + `types.ts`). Gameplay never touches
  `localStorage` or `window` directly, so only a new `desktop.ts` backend is added beside `web.ts`.
- Data layer (`src/data/`): difficulty, enemies, chunks, maps, contentFlags, i18n. No change.
- Input action map (`move`, `dash`, `jump`, `pause`, `confirm`, `cancel`). Steam Input appears as a
  standard gamepad.
- Achievement ids (`data/achievements.json`) already match the intended Steamworks list one to one.

**Should be re-implemented for desktop (the `desktop.ts` backend only):**

- SaveStore: JSON files under `app.getPath("userData")/saves` instead of `localStorage`, for Steam
  Auto-Cloud. Same keys.
- Achievements: `client.achievement.activate(id)` instead of the silent local set.
- Window: real fullscreen/borderless/quit via `BrowserWindow` instead of the Fullscreen API no-ops.
- Presence: optional Rich Presence.

**New, desktop-only (not a rewrite of anything web):**

- `desktop/main.ts`, `desktop/preload.ts`, `steam_appid.txt`, `electron-builder.yml` (the `desktop/`
  folder exists but is empty today).
- steamworks.js init and overlay enable in `main.ts`.
- A CI job that builds win/mac/linux artifacts and an optional SteamPipe upload.

**Do not port to desktop:** the GitHub Pages workflow and the `.nojekyll` / base-path handling are
web-only. Keep the web build shipping in parallel; desktop is an additional target, not a replacement.

## Repo hygiene and workflow

Established in iteration I0 so desktop and store work later is clean. Assume PowerShell syntax for
any local commands run on Windows.

### Versioning (live)

- Semantic versioning on `package.json` `version` (`0.1.0`), pre-1.0 while the game is in
  development: bump minor for new content or systems, patch for fixes and tuning.
- Tag a version after a track of work, not after every iteration. `v0.1.0` marks the M0-M5
  web build. I1-I4 share the next tag when that track closes.
- [CHANGELOG.md](../CHANGELOG.md) (Keep a Changelog format) records each tag. This also seeds
  Steam patch notes later.

### GitHub workflows (live)

- `.github/workflows/pages.yml` builds and deploys on push to `main` (deploy job).
- `.github/workflows/ci.yml` runs on pull requests and on `main`: `npm ci` then `npm run build`
  (which chains `check:path`, `check:jumps`, `check:endless`, `tsc --noEmit`, `vite build`), plus a
  commitlint check on PR commits. The build gate is now a required check, not only a deploy step.
- Still planned: a `release.yml` at M6 for the desktop build matrix and artifact upload; a
  lightweight lint/format step (Prettier or Biome) if style needs enforcing.

### Standardized commit messages (live)

- Conventional Commits: `type(scope): summary`, for example `feat(endless): seeded biome route`,
  `fix(endless): start input bus so keys move the rabbit`, `docs(universe): add biome graph`.
- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `chore`, `build`, `ci`.
- Scopes track the code map: `meadow`, `story`, `tasks`, `endless`, `core`, `data`, `render`, `ci`,
  `docs`.
- Enforced by [commitlint.config.js](../commitlint.config.js): locally through a husky `commit-msg`
  hook, and in CI on PRs. See [CONTRIBUTING.md](../CONTRIBUTING.md).

### Licensing and contributing (live)

- [LICENSE](../LICENSE): source-available, all rights reserved, contributions assigned to the
  project. Compatible with a later paid Steam build.
- [CONTRIBUTING.md](../CONTRIBUTING.md) and [.github/pull_request_template.md](../.github/pull_request_template.md)
  cover the branch/PR flow, commit standard, and contribution terms.

### Branch and PR flow

- Short-lived feature branches per iteration item, PR into `main`, CI green before merge.
- `main` stays deployable (it auto-ships to Pages).

### Repo layout notes

- `desktop/` is committed but empty; it is the placeholder for the M6 shell.
- `dist/` and `node_modules/` are build/output and should stay ignored (`.gitignore` present).

## Working rules

- Menus and overlays: HTML/CSS only (no Phaser Text for chrome)
- Gameplay: Phaser scale target 1920x1080, `Scale.FIT` (Meadow/Tasks currently canvas inside HTML chrome)
- Data before code for enemies, maps, difficulty, content flags
- No second save format or second input action enum
- No folklore name without a [LORE.md](LORE.md) status
- Ship to Pages after each milestone that changes the playable web build
- Stub screens beat missing scenes

## Suggested next coding session

I1 is done (still 0.1.0). Endless walks a seeded biome graph with shorter bands and tier jitter. Next is iteration [I2](iterations/i2-creatures-items.md): enemy and item slots, per-biome rosters, first non-carrot items. Then I3 (theme and rendering), I4 (audio and i18n). Tag the next version after I4. Desktop and store milestones (M6–M8) resume after that.
