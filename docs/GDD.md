# Bunny Meadow — Game Design Document

This is the design hub. Deeper subtrees live under the [docs index](README.md): the derived
world model in [universe/](universe/README.md), the bestiary in [creatures/](creatures/README.md),
collectibles in [items/](items/README.md), Endless detail in [modes/endless/](modes/endless/design.md),
Moon Tasks in [modes/tasks/](modes/tasks/README.md),
shared pads in [platforms/](platforms/README.md),
and the visual language in [rendering/](rendering/README.md). Build order is in [ROADMAP.md](ROADMAP.md).

Family-tone woodland game. Phaser 4 + Vite + TypeScript. Web on GitHub Pages. Steam desktop long-term (Electron + steamworks.js).

Audience: family / all ages (Mario or Kirby stakes). Light peril. Short readable dialogue. Kits (baby rabbits) may go missing by misunderstanding. No death, no predator kidnapping.

First story release: Chapter 1, 4 worlds x 3 levels plus a moon finale. Chapter 2 first stations are live. Chapter 3 West of Silver is on the World Map with Soon worlds ([story/chapters.md](story/chapters.md)).

## Modes

### Meadow (arcade, top-down)

Port of the current canvas game. Collect carrots, return to the burrow, dodge enemies. Gains maps, difficulty presets, enemy roster, unlockable bunny cosmetics. Entry point for younger players.

### Story (side-scroller)

Left-to-right platformer. Authored levels from reusable chunks. Moon Pool checkpoints (Cloud Stair 4-2 and 4-3 restart the station). One boss or chase per world. Hub is the burrow until Mei stays on the moon. World Map is one painting per chapter. Chapter 1 uses `Story-Background.png`. Chapter 2 uses `Story-Background-ch2.png`. Chapter 3 uses `Story-Background-ch3.png`. Chapter 3 worlds are Soon. See [STORY.md](STORY.md), [WORLDS.md](WORLDS.md), and [story/chapters.md](story/chapters.md).

### Moon Tasks (short objectives, 1 to 3 minutes)

Reuse Meadow systems for the M2 set (canvas + maps + Spawner). Bunny Jump is a
vertical hop under this mode, not a fifth primary mode. It cannot share the
Meadow canvas stack. Hub: [modes/tasks/README.md](modes/tasks/README.md).

| Task | Goal | Web status |
| --- | --- | --- |
| Night Watch | Survive waves near the burrow | playable (M2) |
| Hide and Seek | Find hidden kits on a Meadow map | playable (M2) |
| Bunny Jump | Climb one-way pads to a moon disc | planned ([I5](iterations/i5-bunny-jump.md)) |
| Carrot Rush | Collect N carrots under a timer | retired (overlaps Meadow arcade) |
| Lantern Run | Reach the peak before lanterns go out | deferred |
| Daily Moon | Seeded task of the day | deferred |

### Endless Meadow Run

Infinite left-to-right runner from Story chunk prefabs. Free player pace under a difficulty-scaled mist chase wall (Sprout: no chase pressure; other presets speed the wall up with distance). Environments walk a seeded biome graph (I1) so water and dusk can appear early. Layouts stream from pre-authored, build-validated chunk tiers (`src/data/chunks/endless/`, gated by `scripts/check-endless-chunks.mjs`) so a run is never impossible. Falls and water cost a heart and respawn ahead of the wall. Local per-difficulty distance leaderboard only (`progress.endlessRuns`), no accounts. Carrots collected feed the pantry.

## Meta progression

Carrots from any mode feed the burrow pantry. Pantry levels unlock cosmetics and Meadow maps only. Beating Han unlocks Mei's moon helmet the same way `MOON_RETURN` unlocks the moon dash. No gameplay power creep. Difficulty stays honest.

## Difficulty (data-driven)

Presets in `src/data/difficulty.json`. All parameters editable in Settings.

| Preset | Intent |
| --- | --- |
| Sprout | Young children, generous |
| Hopper | Default family play |
| Wildhare | Challenge |
| Moonlit | Hardest standard preset |
| Hardcore | One heart, short timer, dense enemies |

Parameters: hearts, carrotGoal, timerSeconds (0 = untimed), enemyCount, enemyIds, itemChance, enemy count multiplier, enemy speed multiplier, detection radius, attack cooldown, dash cooldown, invulnerability window, checkpoint density, timer multipliers, boss phase count.

Hardcore uses `hearts: 1`. Accessibility invincible still overrides contact damage when enabled.

## Accessibility (independent of preset)

- Invincible mode
- Slow time (0.7x)
- Auto-dash on proximity (assist on Mei, not a map trigger; see [story/proximity.md](story/proximity.md))
- High-contrast palette
- Reduced motion
- Larger text
- One-button touch mode

## Achievements

Ids in `src/data/achievements.json` match Steamworks one-to-one. Web tracks silently. Desktop activates via steamworks.js.

| Id | Name | Trigger |
| --- | --- | --- |
| FIRST_HOP | First Hop | Finish any Meadow run |
| BASKET_FULL | Basket Full | Collect 12 carrots in Meadow |
| HOME_SAFE | Home Safe | Return to burrow with full basket |
| WORLD1_CLEAR | Hedgerow Hopper | Clear Story World 1 |
| WORLD2_CLEAR | Bamboo Runner | Clear Story World 2 |
| WORLD3_CLEAR | Lantern Climber | Clear Story World 3 |
| MOON_RETURN | Moon Return | Finish the moon finale |
| FOX_FOILED | Fox Foiled | Beat Fox Hu cart chase |
| CRANE_FRIEND | Crane Friend | Resolve the Crane Envoy fight |
| TASK_DAILY | Daily Moon | Complete a Daily Moon task |
| ENDLESS_1K | Long Meadow | Reach 1000 m in Endless |
| PANTRY_5 | Full Pantry | Reach pantry level 5 |
| ALL_MAPS | Every Path | Unlock all Meadow maps |
| PERFECT_HEARTS | Soft Landing | Clear a Story level without losing a heart |

## Scope guards

- Art: vector/canvas or small pixel sprites made in-repo. No asset store dependency.
- No backend, no accounts. Progress is local (Steam Cloud is file sync only).
- Dialogue: two lines max per exchange.
- Enemies and maps are data. New code means a new archetype and a doc entry first.
- No folklore element without a [LORE.md](LORE.md) entry (canon / adapted / invented).

## Milestones

Build order, stubs, and frozen contracts live in [ROADMAP.md](ROADMAP.md). Summary:

| Id | Scope |
| --- | --- |
| M0 | Phaser scaffold, Meadow port, platform web impl, Pages build (done) |
| M1 | Meta shell + full stub surface (done) |
| M2 | Meadow maps + Spawner archetypes; Moon Tasks Night Watch + Hide and Seek; Carrot Rush retired (done) |
| M3 | Story W1 on ChunkAssembler, Moon Pools, DialogueOverlay, Fox Hu chase (done) |
| M4 | Worlds 2–3, bosses, moon finale, epilogue; start Steamworks verification |
| M5 | Endless, audio assets, i18n fill, polish |
| M6 | Electron shell, steamworks.js, win/mac/linux builds |
| M7 | Store assets, Coming Soon, demo, Next Fest |
| M8 | SteamPipe, review, wishlist go/no-go, launch |

## Content split (assumption)

Controlled by `contentFlags` in [ROADMAP.md](ROADMAP.md), not hard-coded Mode Select branches.

Default assumption until confirmed before M7:

- Web free: Meadow, Moon Tasks, Story World 1 (`storyWorld1`)
- Steam paid: full story (`storyFull`), Endless, achievements toast, cloud saves, controller polish
- `webFullStory` may override shipping full story on the web later

## References

- [ROADMAP.md](ROADMAP.md) (build order), [STORY.md](STORY.md), [story/chapters.md](story/chapters.md), [LORE.md](LORE.md), [WORLDS.md](WORLDS.md), [ENEMIES.md](ENEMIES.md), [UI.md](UI.md), [STEAM.md](STEAM.md)
