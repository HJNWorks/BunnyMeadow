# Environment — Far Silver

Status: live (Chapter 2, three stations). Hub: [../README.md](../README.md). Chapter:
[../../story/chapters.md](../../story/chapters.md). One Moon Pool:
[../../LORE.md](../../LORE.md#invented-elements-ours). Boss:
[../../creatures/folk/still-silver.md](../../creatures/folk/still-silver.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon |
| Hour | eternal night |
| Lore anchor | the One Moon Pool (invented). The bronze dew-plate immortal ([../../LORE.md](../../LORE.md#the-bronze-immortal-holding-the-dew-plate-承露仙人)) |
| Movement verb | low gravity, keep moving on silver skin |
| Hazard vocabulary | still silver, silver skin, leaping carp, void |

## Feel

Quiet Basin is the approach. Silver Steps goes quieter. The One Moon Pool is the first
true pool: Still Silver rises from it. Ordinary pools on earlier stations stay Chang'e's
reflection channel. Map card title stays Far Silver. Do not print "portal".

Contact with the gather portal after eight aspects form is the Chapter 2 exit into
West of Silver. No burrow on the One Moon Pool station.

## Lore

- **Silver skin.** Far Silver's water is so still it grows a skin. It holds a traveller
  who keeps moving. Stand still and it gives way under you, then closes again.
  "The shore does not hurry", but the water does not wait either.
- **The bronze immortal.** Han Emperor Wu raised bronze immortals holding plates up to
  catch dew for an immortality draught. In Li He's poem the statue weeps when it is
  carried away. One stands in the Quiet Basin, still holding its plate up to the moon,
  with a faint streak down its face. Its plate is a ledge with a mooncake on it. A
  smaller one keeps the Silver Steps shore.
- **Silver carp.** Carp that leap the Dragon Gate become dragons. These leap out of the
  still silver, practising. None has made it yet.
- **Farther is quieter.** The far layer is a flat silver lake. A faint ring on the
  horizon is the One Pool. It is never labeled.

## Stations

| Station | Id | Chunks | Notes |
| --- | --- | --- | --- |
| Quiet Basin | `ch2_silver_1_basin` | `a`, `b`, `g` | Speaks. Stone lips and three skin runs over one still basin. Silver carp under each run. The bronze immortal mid-basin: climb to its plate for the mooncake. Well silver for glow |
| Silver Steps | `ch2_silver_2_steps` | `c`, `d`, `h`, `i` | Speaks. A stair of stone steps (rest) and silver steps (do not stop) over two pools. A long skin run with two carp after the pool shore. Star wisps. Osmanthus seed keepsake by the small bronze immortal on the far shore |
| One Moon Pool | `ch2_silver_3_one_pool` | `e`, `f` | Unchanged. No Chang'e ticker. Still Silver 13-heart fight. Portal clear |

Every hop on the two approach stations is a single jump at 0.42 g.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Silver skin | platform `asset: "skin"`, `break: { profile: "silver", hp: 0.8, sources: ["still"], regrow: 1.6 }` | Holds Mei while she moves (x speed of 30 or more). 0.8 s standing still and it gives. Grows back 1.6 s later, and on respawn |
| Silver carp | enemy `silver_carp` | Carp water kit bound to the nearest water. Leaps to about 250 px above the surface. Stomp from above |
| Bronze immortal | decor `dewPlate` plus a thin ground ledge at its plate | Landmark. The plate ledge is 14 px inside the statue's width, about 6 px under its top |

## Roster

Wildlife: [silver carp](../../creatures/wildlife/silver-carp.md), sparse
[star wisps](../../creatures/wildlife/star-wisp.md). Folk: Still Silver on the finale.
No folk HP bars for Chang'e or immortals.

## Item table

| Item | Notes |
| --- | --- |
| well_silver | 1.6 s glow. Comes back 5 s after pickup |
| mooncake | +1 heart. On the bronze immortal's plate, and over a stone step |
| osmanthus_seed | keepsake. Silver Steps far shore |

## Render notes

Palette `ch2_silver`: still silver. Weather `starDrift`. Boss stamp `story_still`. Far
layer `story_far_silver`. Moon water is dark with a silver skin line. Skin pads are pale
silver.

## Editor

Environment → Chapter 2 → Far Silver lists Silver skin (with its break preset) and the
Dew-plate immortal. Creatures → Chapter 2 → Far Silver lists the silver carp.

## Endless status

Story Chapter 2 only.
