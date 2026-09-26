# Environment — Cassia Wound

Status: live (Chapter 2, three stations: Grove Cut, Closing Gap, Gold Core). Wu Gang’s self-healing osmanthus as a region, not a
single tree in a courtyard. Hub: [../README.md](../README.md). Lore:
[../../LORE.md](../../LORE.md#wu-gang-吳剛).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon |
| Hour | eternal night |
| Lore anchor | Wu Gang, Penghou ([../../LORE.md](../../LORE.md#penghou-spirit-of-an-old-tree-彭侯)) |
| Movement verb | low gravity, vertical climb, wall bounce on living wood |
| Hazard vocabulary | healing bark, closing cuts, gold wound, gaps |

## Feel

Every cut closes. She stops because the gap she needs slides shut. Living wood is
the wall she bounces. Elixir crumb is the slow fall for that gap. Platforms grow back.
Family tone: the tree is stubborn, not cruel.
Weather is `none`. Specks are not falling snow.

The bark chips from each blow drift on to the next world. Yutu pounds that cassia
into the elixir, and cassia grubs (桂蠹) ride in on the chips
([mortar-yard.md](mortar-yard.md#lore)).

## Lore

- **Wu Gang** chops at the foot of the tree forever. He is only a tiny far figure with
  a raised axe in the far layer (`story_far_cassia`). Never an HP bar. Never close.
- **The tree heals.** Bark ledges crack under Mei and grow back. Cuts in the trunk's
  shelves pull open and slide shut again on a beat.
- **Penghou (彭侯).** A felled tree bleeds, and its spirit comes out: a tailless dog of
  dark bark with a pale carved face. This tree is cut forever, so its spirit never
  rests. It keeps the gold heartwood at the top of the trunk. Mei calms it by closing
  the gold cuts it can never finish mending. See
  [../../creatures/folk/penghou.md](../../creatures/folk/penghou.md).

## Stations

All three are vertical climbs inside or up the trunk. Level JSON sets `height`, so
the climb above y 0 is inside the world.

| Station | Chunks | Height | What it is |
| --- | --- | --- | --- |
| Grove Cut | `a`, `b` | 1900 | Unchanged climb up the living wood. Now `height` 1900 so the top and the exit are reachable |
| Closing Gap | `c`, `d` | 2200 | Inside the trunk between two living-wood walls. Three tiers of healing bark ledges. Each tier ends in a shelf with a bark cut. The last ledge of a tier sits under its cut: wait for it to open, hop up through, step onto the shelf. Cassia grubs on the shelves |
| Gold Core | `e`, `f` | 2400 | A short climb up the trunk to a Moon Pool under the heartwood room, then the Penghou fight |

Ledges zigzag so no ledge sits right under the next one. Living wood blocks from
below.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Healing bark | `wound` pad with `break: { profile: "wood", hp: 0.9, sources: ["stand"], regrow: 3 }` | Cracks after about a second of standing, falls, and grows back after 3 s. Also restored on respawn |
| Bark cut | two `movers[]` with `kind: "bark"`, `axis: "x"`, `amplitude` −half / +half | Rect is the shut position. The slabs pull apart (open) fast, hold open, then slide shut with gold sparks. Solid on top. From below it bonks Mei's head. Drawn behind the shelf pads so the slabs withdraw into the wood |
| Heartwood room | `boss: { kind: "penghou", court, cuts, x, y }` | See the folk page. The floor cut stays shut while the spirit is awake |
| Heartwood (decor) | `kind: "heartwood"` | Gold growth rings behind the room |

## Roster

Folk: Wu Gang as a distant figure who keeps chopping. Not an HP bar.
[Penghou](../../creatures/folk/penghou.md) in the heartwood room (Gold Core).

Wildlife: [cassia grub](../../creatures/wildlife/cassia-grub.md) (Closing Gap). This
tree is its home.

## Item table

| Item | Notes |
| --- | --- |
| elixir_crumb | 2.5 s slow-fall. Comes back 5 s after pickup |
| mooncake | +1 heart. One per climb, one on the heartwood room's top ledge |

## Render notes

Palette `ch2_cassia`: grey wood, gold accent. Wound stamp on living wood. Bark cut
stamp `story_bark` with a gold healing edge. Gold cuts `story_cut`. Far layer
`story_far_cassia`.

## Editor

Environment → Chapter 2 → Cassia Wound lists Bark cut (one slab: place a second with
the opposite `amplitude`) and Heartwood. Healing bark is a `wound` platform with
Destructible on and `regrow` set in JSON. Penghou is set in the level JSON, not
placed.

## Endless status

Story Chapter 2 only.
