# Iteration I4 — Audio and i18n

Goal: close the two items left open from M5. Hub: [README.md](README.md). These were tracked as
"still open" on M5 in [../ROADMAP.md](../ROADMAP.md).

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

## Graduates to live

- Closes the remaining open bullets under M5 in [../ROADMAP.md](../ROADMAP.md).

## After I4

The web build is feature-complete for this phase. The postponed desktop and store milestones (M6-M8)
resume; see the Electron transfer notes in [../ROADMAP.md](../ROADMAP.md).

## Ship

Build gate passes; ship to Pages; tag a minor version.
