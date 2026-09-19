# Story chapters

Mei's Journey is three chapters. Each chapter is a World Map painting with its own
worlds and stations. Hub: [../STORY.md](../STORY.md). Path tables: [../WORLDS.md](../WORLDS.md).
Folklore: [../LORE.md](../LORE.md).

Chapter sits above World. World still sits above Station. Readers here are not assumed
to have the codebase open.

| Id | Display title | Status |
| --- | --- | --- |
| `ch1` | Burrow to Moon | live |
| `ch2` | Journey on Moon | live (first stations) |
| `ch3` | untitled | planned |

Off-limits as HP bars in every chapter: Chang'e, Yue, Yutu, Wu Gang, moon toad,
Crane Envoy, Fox Hu.

## Chapter 1 — Burrow to Moon

The live climb. Worlds 0 to 4 plus Guanghan. Painting:
[../../public/Story-Background.png](../../public/Story-Background.png).

Guanghan is already the moon palace. Han settles into a grown moon at his last place.
That moon is the **inner gate** into the rest of Vast Cold, not a first arrival from
Earth. Yue and the burrow kits take the crane home. Mei does not. She jumps onto
Han's moon. That landing unlocks Chapter 2.

Today the grown moon is visual only and the Guanghan exit is the four epilogue cards,
then World Map. Later code: the moon becomes a contact pad. Jump on it after the gift
beat. No burrow-exit as Mei's Chapter 1 finisher.

## Chapter 2 — Journey on Moon

Lunar country beyond the palace walls. Tagline stays vague. Map title does not name
the One Moon Pool. Painting: `public/Story-Background-ch2.png`. Prompt:
[chapter2-map-prompt.md](chapter2-map-prompt.md). First station of each world is live.

Six worlds, same card count as Chapter 1:

| Map title | What it is |
| --- | --- |
| Outer Cold | First region after Han's gate. Palace gardens and frost courtyards. Still the moon. Not Earth. Reuses the `moon` kit |
| Cassia Wound | Wu Gang's self-healing osmanthus as a region |
| Mortar Yard | Yutu pounding elixir. Cakes and pestle hazards. Not a kitchen |
| Dust Sea | Crater plains, low-g dust, invented fauna |
| Quiet Wells | Cold caves. Toad pools as background, not an HP bar |
| Far Silver | The One Moon Pool. Portal into Chapter 3. Do not print "portal" on the card |

Unlock: `moon_guanghan` cleared. Han's grown moon stays visual. No jump pad this pass.

## Chapter 3 — untitled

Starts at Far Silver. Working choice: **ascent** toward a higher immortal court.
[Xiwangmu](https://en.wikipedia.org/wiki/Queen_Mother_of_the_West) / Kunlun is the
lore-clean candidate (already the source of Chang'e's elixir). Do not name the chapter
yet.

Descend-to-save-the-kits is closed. Yue is already home. A second kidnapping would
break the family tone.

## Two gates

| Gate | From | To | Object |
| --- | --- | --- | --- |
| Inner gate | Chapter 1 Guanghan | Chapter 2 Outer Cold | Han's grown moon (jump) |
| One Moon Pool | Chapter 2 Far Silver | Chapter 3 | The first true pool (contact) |

Ordinary Moon Pools stay Chang'e's reflection channel. One line. No freeze card. The
One Pool is the exception.

## Editor

Build bar: **Chapter** dropdown left of World, then Station
(`src/modes/story/editor/BuildHud.ts`). Chapter 1 lists live worlds. Chapter 2 lists the
six first stations. Chapter 3 stays empty.

TODO: Han moon collider (not this pass). Live epilogue copy in `en.json` / `voices.json`
still says the crane carries them all home.
