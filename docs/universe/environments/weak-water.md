# Environment — Weak Water

Status: live, first station (Chapter 3, West of Silver). Hub: [../README.md](../README.md).
Chapter: [../../story/chapters.md](../../story/chapters.md). Canon geography:
[../../LORE.md](../../LORE.md#weak-water-弱水).

Palette `ch3_water`. Hops return toward Earth weight.

## Stations

| Station | Id | Chunks | Notes |
| --- | --- | --- | --- |
| Stone Ford | `ch3_water_1_ford` | `a`, `b`, `c` | Live. Stones bear weight. Reed mats look like steps and give 0.15 s after Mei lands (regrow 2 s). Every reed is optional: the next stone is always one hop away. Two ford crabs on the wide stones. Silent Moon Pool mid-ford ("Only the stones hold") |
| Feather Line | `ch3_water_2_feather` | `d`, `e`, `f` | Live. Long stone hops (200–280 px) with reed mats in the middle of each gap. Two ford crabs on the wide stones. Silent Moon Pool ("A feather would sink here too") |
| Breathing Stones | `ch3_water_3_breath` | `g`, `h`, `i` | Live. Mover `kind: "ford"` stones bob 80 px on `y` (speed 1.6, phases offset) and dip under the surface. Staying on a sunk stone is falling in. One ford crab on the only fixed mid-stone |

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Reed mat | platform `asset: "reed"`, `break: { profile: "reed", hp: 0.15, sources: ["stand"], regrow: 2 }` | Gives almost at once under a standing paw. Editor token "Reed mat" |
| Weak Water | hazard `water` | Silver-jade. Falling in returns Mei to the last pool |

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | west ford |
| Hour | west dawn |
| Lore anchor | Weak Water (弱水) |
| Movement verb | stone ford |
| Hazard vocabulary | water that will not bear a body |

## Feel

Nothing floats. Stone stepping pads only. Not Riverbank logs. No boats. Map card
title stays Weak Water. Do not print Kunlun.

Teach: do not ride the water. Japanese mochi-kitchen is out. No NASA craft.

## Roster

Wildlife: [ford crab](../../creatures/wildlife/ford-crab.md) (live, patrol). No folk HP bars.

## Item table

| Item | Notes |
| --- | --- |
| jade dew | idea. Brief west glow. Not immortality |

## Render notes

A pale river that looks uncrossable. Stone pads. Empty bank for a later World Map
card.

## Endless status

Story Chapter 3 only.
