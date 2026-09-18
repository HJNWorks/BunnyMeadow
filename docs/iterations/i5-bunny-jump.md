# Iteration I5 — Bunny Jump docs

Status: in progress (docs). Hub: [README.md](README.md). Design:
[../modes/tasks/bunny-jump.md](../modes/tasks/bunny-jump.md).

This iteration writes the Moon Tasks climb as `planned`. Code later graduates those
facts to `live`. No playable scene in this slice. No `package.json` bump. No new
Steam achievement ids.

## Deltas (this slice)

Docs:

- Moon Tasks hub and Bunny Jump page under [../modes/tasks/](../modes/tasks/README.md)
- Jump roles on wildlife pages and [../ENEMIES.md](../ENEMIES.md)
- Auto-bounce as a task-only verb on [../creatures/abilities.md](../creatures/abilities.md)
- `land` hit-count source on [../editor/destructibility.md](../editor/destructibility.md)
- Shared pad axes under [../platforms/README.md](../platforms/README.md) (slide
  motion, one-way collision, bounce / boost / slick surfaces)

## Graduates to planned

- Bunny Jump under Moon Tasks ([../GDD.md](../GDD.md))
- `BunnyJump` scene key (future) on [../UI.md](../UI.md)
- Bees, tortoise, and boar as Bunny Jump debuts (Story status stays idea)

## Not in this slice

`TaskRunner`, `tasks.json`, i18n strings, Phaser scene, one-way pads, auto-bounce,
shared slide movers, `land` in `breakables.ts` / `breakables.json`, `jumpKit.ts`,
`migrateSave` for `progress.bunnyJumpBest`.

## After I5 docs

Code for Bunny Jump is a later I5 code pass, or a following iteration. M6-M8 stay
postponed.

## Ship

Docs-only. Pages updates when the files land on `main`.
