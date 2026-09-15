# Bunny Meadow — Implementation Roadmap

Continues from M0 (done). Source of truth: [GDD.md](GDD.md), [UI.md](UI.md), [STORY.md](STORY.md), [WORLDS.md](WORLDS.md), [ENEMIES.md](ENEMIES.md), [STEAM.md](STEAM.md), [LORE.md](LORE.md).

## Done (M0)

- Phaser 4 + Vite + TypeScript scaffold
- Meadow arcade port (`MeadowRuntime` / `MeadowScene`)
- `core/platform` web implementation
- Design docs and Pages npm build
- Crisp HTML Title shell (menus stay DOM, gameplay stays canvas/Phaser)

## Next: M1 Meta shell

Goal: players can leave the title into a mode picker, change settings, and keep progress across reloads. No new gameplay modes yet beyond Meadow.

### Deliverables

1. **Shared DOM menu kit** (`src/ui/`)
   - Reusable shell styles (cream/green palette already used by Title and Meadow)
   - Button, panel, back-nav patterns so Settings / Mode Select / Customize match

2. **Mode Select scene**
   - Entries: Meadow (live), Story / Moon Tasks / Endless (locked or “soon” with pantry/stub message)
   - Wire Title → Mode Select → Meadow

3. **Save system (schema v1 from UI.md)**
   - `SaveStore` already exists. Add `core/save.ts`: load/migrate/write three slots
   - Last-used slot + settings mirror
   - Hook Meadow win into pantry carrot count (even if UI for pantry is minimal)

4. **Settings scene**
   - Difficulty preset from `difficulty.json` (Sprout / Hopper / Wildhare / Moonlit)
   - Per-parameter overrides later if time; presets first
   - Accessibility toggles (at least invincible, slow time, larger text, reduced motion)
   - Audio sliders (wire to stubs until M5 audio)
   - Language selector shell (EN default; DE / ZH-Hans string table stub)

5. **Customize scene**
   - Name, fur, ears, accessory fields from UI.md
   - Unlock gates can be soft (all free) until pantry levels matter in M2

6. **Input**
   - Keyboard remap table in settings
   - Gamepad polling via Phaser plugin; same actions as WASD / Space / Pause
   - Touch path already in Meadow; keep it

7. **Achievements registry**
   - Read `achievements.json`; Meadow already unlocks FIRST_HOP / BASKET_FULL / HOME_SAFE
   - Settings or a small Credits/Achievements panel listing unlocked ids

### Exit criteria

- Reload keeps difficulty, cosmetics, and slot data
- Mode Select is the hub; Title only boots into it
- Gamepad can start Meadow and move/dash/pause
- No blur on Title / Mode Select / Settings (HTML shells)

## Then: M2 Meadow expansion

- Meadow map JSON format + three extra maps ([WORLDS.md](WORLDS.md))
- Enemy archetypes: patrol, chaser, ranged_lob, reach ([ENEMIES.md](ENEMIES.md))
- Difficulty multipliers applied in MeadowRuntime
- Two Moon Tasks: Carrot Rush + Hide and Seek
- Pantry unlocks maps / cosmetics for real

## Then: M3 Story vertical slice

- Story physics (run, jump, dash, wall bounce)
- Level loader for Tiled / chunk prefabs
- Moon Pools + DialogueOverlay (two-line rule)
- World 1-1 through Fox Hu cart chase ([STORY.md](STORY.md), [WORLDS.md](WORLDS.md))
- Every lore line checked against [LORE.md](LORE.md)

## Later (summary)

| Milestone | Focus |
| --- | --- |
| M4 | Worlds 2–3, bosses, moon finale, epilogue |
| M5 | Endless, audio, i18n fill, polish |
| M6 | Electron + steamworks.js ([STEAM.md](STEAM.md)) |
| M7–M8 | Store page, demo, Next Fest, launch |

## Working rules

- Menus and overlays: HTML/CSS for crisp text (Title/Meadow pattern)
- Gameplay cameras: Phaser, design size 1920×1080, Scale.FIT
- Data before code for enemies/maps/difficulty
- No folklore name without a LORE.md status
- Ship to Pages after each milestone that changes the playable web build

## Suggested first implementation slice (after this doc)

Order for the next coding session:

1. Extract shared menu CSS / helpers from Title + Meadow shells
2. Mode Select scene
3. Save schema + Settings (difficulty + accessibility)
4. Customize + gamepad bindings
5. Deploy and smoke-test on Pages
