# Chapter 3 — Station plan

Plan for the five unbuilt West of Silver worlds. West Pool is live with one station
([west-pool.md](../universe/environments/west-pool.md)). Chapter hub:
[chapters.md](chapters.md).

Rules that hold for every station below:

- Earth weight. `lowGravity` off. Gaps use Chapter 1 reach (single 311 px, hard gap
  349 px, see `npm run check:jumps`), not the 0.42 g spacing of Chapter 2.
- West dawn palette family (`ch3_pool` is the reference: warm sky, jade accent).
- Cards never print Kunlun, Yaochi, portal, 西王母, the seal, or 心魔.
- No kitchen, no mochi, no NASA, no ships. Xiwangmu is never an HP bar or a sprite.
- Every new creature reuses an existing archetype kit. A creature becomes pickable
  in the editor only after it is live in `enemies.json`.

## Lore readiness

| World | Lore today | Missing before a build |
| --- | --- | --- |
| Other Shore | Five axes, feel. Mirror motes idea, no page | Station beats, mechanic, mirror mote page, palette, ticker lines |
| Weak Water | Canon entry in LORE.md. Five axes, feel. Ford crab idea, no page | Station beats, sinking rule, ford crab page, palette |
| Hanging Ridges | Five axes, feel. Copper sentry page (idea) | Station beats, pin rule, palette |
| Peach Rows | Five axes, feel. Azure bird page (idea), canon entry | Station beats, fruit rule, palette |
| Grotto Heaven | Five axes, feel. Jade mite page (idea) | Station beats, falling mass rule, palette |
| West Pool | Complete: map, mechanic, roster, beat, i18n | Art pass only (see below) |

Open lore question for all five worlds: do Moon Pools speak off the moon? Chang'e's
reflection channel is a moon rule. Proposal: ordinary pools here are silent
checkpoints. The ticker carries Mei's own short lines instead. West Pool already has
no Chang'e ticker.

## Station counts

| World | Stations | Why |
| --- | --- | --- |
| Other Shore | 2 | Arrival. A short breath after the One Pool fight |
| Weak Water | 3 | A real crossing. Teach, test, finale |
| Hanging Ridges | 3 | The climb is the chapter's long ascent |
| Peach Rows | 2 | Calm before the grotto. The peach is saved for West Pool |
| Grotto Heaven | 2 | Short dark run into the court |
| West Pool | 1 | Live |

Thirteen stations total. First stations ship first. Later stations stay `soon: true`
on their station entry until they are built.

## Other Shore (`ch3_shore`)

| # | Station | Id | What happens |
| --- | --- | --- | --- |
| 1 | Far Bank | `ch3_shore_1_bank` | Mei steps out of the One Pool onto the far bank. Every hop falls short at first: weight is back. Wide flat stones, short gaps, then the first 300 px gap. The silver water behind her is the inverted sky. Exit: the bank path west |
| 2 | Mirror Sky | `ch3_shore_2_mirror` | Pads are sparse. The still water shows pads that are only reflections (Quiet Wells reflection lips, silver tint). Mirror motes drift between the real pads |

Creatures: mirror mote (new page, swarm kit like star wisp. Dash passes).
Environment: `ch3_shore` palette and env kit, silver-water strip, reeds, white
flowers, a stone bank. Reuse `reflection` and `pool` decor.
Editor: env kit `ch3_shore`, `storyEnvForLevel` branch, chunk ids `chunk_ch3_shore_*`.

## Weak Water (`ch3_water`)

| # | Station | Id | What happens |
| --- | --- | --- | --- |
| 1 | Stone Ford | `ch3_water_1_ford` | A pale river under every gap. Only stone bears weight. Reed mats and leaf pads look like steps and sink the moment Mei lands. Falling in costs a heart and returns her to the last stone (Court water rule) |
| 2 | Feather Line | `ch3_water_2_feather` | Long crossings of mixed stones and sinking pads. Ford crabs patrol the wide stones |
| 3 | Breathing Stones | `ch3_water_3_breath` | Stones rise and sink on a beat (dust-tide vent timing). Cross on the up beat. Finale run to the far bank. No boss |

Creatures: ford crab (new page, crater crab patrol kit, river grey).
Environment: `ch3_water` palette, `stone` pad asset, sinking `reed`/`leaf` pad
(break profile with instant give and regrow), Weak Water hazard volume (reuse Court).
Editor: env kit `ch3_water`, placeables `stone`, `reed`. Never `log` (no floating).

## Hanging Ridges (`ch3_ridges`)

| # | Station | Id | What happens |
| --- | --- | --- | --- |
| 1 | Pin Ladder | `ch3_ridges_1_pins` | Vertical. Copper pins in cliff faces are small perches. Wall hops between facing cliffs (`wallBounce`). Teach the wall hop with a safe floor |
| 2 | Sentry Ledges | `ch3_ridges_2_sentries` | Copper sentries lob from pins above empty ledges. Hop the lob, do not idle on a pin |
| 3 | Cloud Crossing | `ch3_ridges_3_cloud` | The ridge top. Cloud pads between two summits (Cloud Stair kit, Earth weight). Crane and cloud are how this land travels. No ships |

Creatures: copper sentry (page exists, add to `enemies.json`, ranged_lob like
pestle sentry).
Environment: `ch3_ridges` palette, `pin` perch asset, cliff `wall` faces, pines,
mist bands, cloud pads.
Editor: env kit `ch3_ridges`, placeable `pin`. Level flag `wallBounce` per station.

## Peach Rows (`ch3_peach`)

| # | Station | Id | What happens |
| --- | --- | --- | --- |
| 1 | Blossom Rows | `ch3_peach_1_blossom` | Hop along tree crowns and branch ledges in rows of blossom. Azure birds circle a row and dive along a shown line. Petals drift (cosmetic) |
| 2 | Green Fruit | `ch3_peach_2_green` | Unripe fruit hangs under branches and drops when Mei lands on that branch (falling hazard, one heart). The peach itself is never a pickup |

Creatures: azure bird (page exists, add to `enemies.json`, diver like gale magpie).
Environment: `ch3_peach` palette (pink and green, not osmanthus gold), `blossom`
crown platform, `branch` ledge, green fruit drop, petal particles.
Editor: env kit `ch3_peach`, placeables `blossom`, `branch`, `greenFruit`.

## Grotto Heaven (`ch3_grotto`)

| # | Station | Id | What happens |
| --- | --- | --- | --- |
| 1 | Jade Mouths | `ch3_grotto_1_mouths` | Quiet Wells cave kit restamped in jade. Real mouths and false mouths off the hop line. Jade mites deny a mouth. Dash through or wait |
| 2 | Mass Above | `ch3_grotto_2_mass` | Jade stalactites shiver and fall when Mei passes under (telegraph, then drop). The exit opens onto the West Pool terrace |

Creatures: jade mite (page exists, add to `enemies.json`, swarm like dust mite).
Environment: `ch3_grotto` palette, jade `ceiling`, `falseMouth`, `stalactite`
(falling variant), jade glow.
Editor: env kit `ch3_grotto`, jade variants of the wells placeables.

## West Pool art pass (live, follow-up)

Seen in the editor: the court plays, the old face and wisps work. Still placeholder:

- Flat cream backdrop. No jade terrace, no court pillars, no west-dawn sun.
- Terraces and rim lips use the meadow grass platform look. They should be jade stone.
- The pool is a flat teal box. It needs a still surface line and the pale shape under it.
- The stamp HUD uses ♥/♡, so it reads as a second heart bar. Docs ask for four stamp marks.

## Progress

| Station | State |
| --- | --- |
| `ch3_pool_1_court` | live |
| `ch3_shore_1_bank` | live (2026-10-12) |
| `ch3_water_1_ford` | live (2026-10-12). Reed mat pad, ford crab |
| `ch3_ridges_1_pins` | live (2026-10-12). Pin and cliff assets, copper sentry |
| `ch3_peach_1_blossom` | live (2026-10-12). Crown, branch, trunk assets, azure bird |
| `ch3_grotto_1_mouths` | live (2026-10-12). Jade cave restamp, jade mite |
| Second and third stations | live (2026-10-12): Mirror Sky, Feather Line, Breathing Stones, Sentry Ledges, Cloud Crossing, Green Fruit, Mass Above. New: mirror mote, `ford` and `cloud` mover kinds, `drop` hazard (`src/modes/story/shared/drops.ts`) |
| West art family | live: `story_ground_west`, `story_far_west`, jade caps, silver-jade water for every `ch3_*` env |

## Build order

1. First station of each world, in map order: `ch3_shore_1_bank`, `ch3_water_1_ford`,
   `ch3_ridges_1_pins`, `ch3_peach_1_blossom`, `ch3_grotto_1_mouths`. Each world goes
   live with one playable station and its later stations listed as `soon`.
2. Per station: palette, env kit, chunks, level JSON, station entry, i18n (en, de,
   zh), then a live look in the editor (Settings → Map editor → West of Silver).
3. Creature pages to `enemies.json` as their world ships: ford crab, copper sentry,
   azure bird, jade mite, mirror mote.
4. Then the remaining stations, then the West Pool art pass.
