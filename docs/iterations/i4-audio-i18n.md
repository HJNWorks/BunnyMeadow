# Iteration I4 — Audio and i18n

Status: done. Hub: [README.md](README.md). These were tracked as
open M5 leftovers in [../ROADMAP.md](../ROADMAP.md).

## Deltas

Audio:

- Music and sfx assets on the existing audio bus (`src/core/audio.ts`). The bus API already exists;
  this is assets, not new systems.
- At minimum: one loop per biome group, jump, dash, pickup, hurt, heart lost, mist-wall catch, menu
  confirm and cancel.
- Self-made or CC0 only ([../STEAM.md](../STEAM.md) licensing).

i18n:

- Fill DE and ZH-Hans strings for menus and in-run copy through `t()` (`src/core/i18n.ts`), including
  the new Endless lobby lines and any creature or item names surfaced to the player.
- Keep two-line dialogue limits.

## Shipped

- Procedural Web Audio on the existing bus: master / music / sfx gains, first-gesture unlock,
  pentatonic loops for `menu`, `meadow`, `dusk`, `night`, and `moon`, and the eight sfx ids.
- `t(key, vars?)` interpolation. Same key set in EN, DE, and ZH-Hans for menus, HUD, World Map,
  Story overlay and epilogue, Endless lobby and results, and on-screen item hints.

## Graduates to live

- Closes the remaining open bullets under M5 in [../ROADMAP.md](../ROADMAP.md).

## After I4

The web build is feature-complete for this phase. The postponed desktop and store milestones (M6-M8)
resume; see the Electron transfer notes in [../ROADMAP.md](../ROADMAP.md).

## Ship

Build gate passed. Tagged `v0.2.0` and shipped to Pages.
