# Story chapters

Mei's Journey is three chapters. Each chapter is a World Map painting with its own
worlds and stations. Hub: [../STORY.md](../STORY.md). Path tables: [../WORLDS.md](../WORLDS.md).
Folklore: [../LORE.md](../LORE.md).

Chapter sits above World. World still sits above Station. Readers here are not assumed
to have the codebase open.

| Id | Display title | Status |
| --- | --- | --- |
| `ch1` | Burrow to Moon | live |
| `ch2` | Journey on Moon | live (three stations per world) |
| `ch3` | West of Silver | live (map, worlds soon) |

Off-limits as HP bars in every chapter: Chang'e, Yue, Yutu, Wu Gang, moon toad,
Crane Envoy, Fox Hu, Xiwangmu.

## Chapter 1 — Burrow to Moon

The live climb. Worlds 0 to 4 plus Guanghan. Painting:
[../../public/Story-Background.png](../../public/Story-Background.png).
Overhaul (docs lock, then sequenced map work):
[chapter1-overhaul.md](chapter1-overhaul.md).

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
[chapter2-map-prompt.md](chapter2-map-prompt.md). Three stations per world are live.

Six worlds, same card count as Chapter 1:

| Map title | What it is |
| --- | --- |
| Outer Cold | First region after Han's gate. She stops because the courts still keep a guest. Short roof hops, one dust mite, star grit |
| Cassia Wound | Wu Gang's self-healing osmanthus as a region. She stops because the cut slides shut |
| Mortar Yard | Yutu pounding elixir. She stops for a pestle beat, then hops the bowls. Not a kitchen |
| Dust Sea | Crater plains. She stops because the lips are the only floor. Star grit in the gap |
| Quiet Wells | Cold caves. She stops because the first mouth is false. Well silver shows the real lip |
| Far Silver | Quiet Basin is the approach. Silver Steps goes quieter. The One Moon Pool is the world finale (Still Silver) |

Unlock: `moon_guanghan` cleared. Han's grown moon stays visual. No jump pad this pass.

## Chapter 3 — West of Silver

After the One Moon Pool. The other side is Kunlun, Xiwangmu's west. Map title does
not print Kunlun, Yaochi, portal, or 西王母. Painting:
`public/Story-Background-ch3.png`. Prompt: [chapter3-map-prompt.md](chapter3-map-prompt.md).
Node percents: `CH3_ART_POS` in `src/modes/story/path.ts`.

Finale: she is offered a peach of immortality (the same elixir source Chang'e drank)
and refuses. She stays a kit who waves at the moon. Yue is already home. Rescue is
closed. Japanese mochi-kitchen is out. Yutu already pounds elixir in Mortar Yard.

Hops return toward Earth weight. 0.42 g was vacuum.

Six worlds, same card count as Chapter 2. Map cards are Soon. No stations yet.

| Map title | What it is |
| --- | --- |
| Other Shore | Far side of the pool. Inverted silver sky. Not Earth, not Guanghan roofs |
| Weak Water | 弱水. Nothing floats. Stone fords, not Riverbank logs |
| Hanging Ridges | Kunlun cliffs, copper pins, wall hops |
| Peach Rows | 蟠桃园. Blossom and unripe fruit. Not osmanthus, not a kitchen |
| Grotto Heaven | 洞天. Jade caves, mass above, false mouths off the hop line |
| West Pool | Yaochi court. One still jade pool. Do not print her name |

Chip unlock and playable gate: `ch2_silver_3_one_pool` cleared (Still Silver portal
contact). Chapter 2 chip still opens after `moon_guanghan`. Ordinary Moon Pools never
do this. Editor Chapter 3 stays empty until stations exist.

## Two gates

| Gate | From | To | Object |
| --- | --- | --- | --- |
| Inner gate | Chapter 1 Guanghan | Chapter 2 Outer Cold | Han's grown moon (jump) |
| One Moon Pool | Chapter 2 Far Silver | Chapter 3 | Still Silver aspects gather into a portal (contact) |

Ordinary Moon Pools stay Chang'e's reflection channel. One line. No freeze card. The
One Pool is the exception.

## Editor

Build bar: **Chapter** dropdown left of World, then Station
(`src/modes/story/editor/BuildHud.ts`). Chapter 1 lists live worlds. Chapter 2 lists all
eighteen stations. Chapter 3 stays empty.

TODO: Han moon collider (not this pass). Live epilogue copy in `en.json` / `voices.json`
still says the crane carries them all home.
