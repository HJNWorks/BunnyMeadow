# Environment — Hanging Ridges

Status: live, first station (Chapter 3, West of Silver). Hub: [../README.md](../README.md).
Chapter: [../../story/chapters.md](../../story/chapters.md). Ascent on Kunlun
cliffs. Cards do not print Kunlun.

Palette `ch3_ridges`. Hops return toward Earth
weight.

## Stations

| Station | Id | Chunks | Notes |
| --- | --- | --- | --- |
| Pin Ladder | `ch3_ridges_1_pins` | `a`, `b` | Live. Vertical, `wallBounce`, height 1500. Chunk `a` has a safe floor: copper pins zig-zag up beside a tall ridge face, a bounce off the face helps onto the rest ledge. Silent Moon Pool on the shelf ("Pins hold one paw"). Chunk `b` is the pin ladder over empty air with one copper sentry on a pin above. A fall returns Mei to the pool |
| Sentry Ledges | `ch3_ridges_2_sentries` | `c`, `d`, `e` | Live. Empty ledges over air, rising. Three copper sentries, each on its own pin above the line |
| Cloud Crossing | `ch3_ridges_3_cloud` | `f`, `g`, `h` | Live. Mover `kind: "cloud"` pads (`story_cloud_west`) drift on `x` between summit ledges. One sentry mid-way. No ships |

Assets: platform `asset: "pin"` (48×14 copper peg), `asset: "cliff"` (ridge face).
Both are editor tokens. This is an ascent off the moon, not a second Dust Sea.

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | west mountain |
| Hour | west dawn |
| Lore anchor | Kunlun ridges ([../../LORE.md](../../LORE.md#xiwangmu--queen-mother-of-the-west-西王母)) |
| Movement verb | Earth-weight wall hop |
| Hazard vocabulary | cliffs, copper pins, empty ledges |

## Feel

Hanging mountain ridges. Copper pins. Wall hops under Earth weight. Travel is
crane and cloud in lore. Star raft stays a Dust Sea wreck. No ships here.

## Roster

Wildlife: [copper sentry](../../creatures/wildlife/copper-sentry.md) (live,
ranged_lob). No folk HP bars.

## Item table

| Item | Notes |
| --- | --- |
| jade dew | idea. Brief west glow. Not immortality |

## Render notes

Copper pins and empty ledges for a later World Map card. No astronauts. No
colonies.

## Endless status

Story Chapter 3 only.
