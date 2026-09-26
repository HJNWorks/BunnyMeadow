# Environment — Dust Sea

Status: live (Chapter 2, three stations: Rim Walk, Lip Gap, Raft Wreck). Crater plains. Hub: [../README.md](../README.md).
Fauna: [../../LORE.md](../../LORE.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon |
| Hour | eternal night |
| Lore anchor | invented lunar country (Vast Cold beyond the palace). Star raft ([../../LORE.md](../../LORE.md#star-raft-星槎)) |
| Movement verb | low gravity, long drifts, tide drift, vent lift, plank ride |
| Hazard vocabulary | crater lips, dust tides, sinking dust, void |

## Feel

Round basins like dry seas. She stops because the only floor is a crater lip, and the
gap between lips is the verb. The dust is a sea after all: it drifts, it breathes,
and it swallows what stands still. Star grit sits near the widest gaps so 0.42 g can
be read. Odd silhouettes, folk names. Not NASA dunes.

## Lore

- **A slow sea.** The dust moves in tides (尘潮). A tailwind band carries Mei over a
  gap. A headwind band makes the same gap long. Nothing in a tide hurts.
- **Vents.** Some craters breathe. A vent is a tide that pushes up for part of its
  beat, then rests. A small puff at its mouth warns that it is about to breathe.
- **Sinking dust.** Soft ash lies in the crater floors. Mei sinks slowly. While she is
  shallow she can still hop out. Once her head is under, she drifts back to the last
  Moon Pool.
- **The star raft (星槎).** In the Bowuzhi a raft comes every eighth month and sails
  up the Silver River. One of those rafts ran aground here instead. Its planks drift
  on the dust, its deck lies broken, and its star lantern still hangs from the mast.
  It is a raft of immortals, not a ship.
- **The Silver River (天河).** The pale band across the far sky is the raft's old road.
  The Weaver Girl and the Cowherd are never shown.
- **Crater crabs.** Grey crabs whose shells look like tiny craters. They walk the lips
  sideways and dig into the dust for a moment.

## Stations

Low gravity (0.42 g): a jump rises about 215 px and carries about 300 px on the flat.
A vent lifts Mei at 360–380 px/s while it breathes. Plain gaps are single jumps. The
widest ones want the tailwind, the air jump, or star grit.

| Station | Chunks | Teaches | Test | Pool |
| --- | --- | --- | --- | --- |
| Rim Walk | `a`, `b`, `g` | A shallow dust crater you can jump or fall into and hop out of. A tailwind over a gap | A short headwind gap. The first vent from a dust crater up to a high lip. Crabs, star grit | chunk 1 |
| Lip Gap | `c`, `d`, `h`, `i` | A 420 px gap under a tailwind. A headwind gap with grit on the lip | Two vents half a beat apart: A up to a high lip, then B up to the top lip. A windy descent to the exit | chunk 2 |
| Raft Wreck | `e`, `f`, `j`, `k` | Raft planks drifting over a dust sea | The wreck: stern deck with the mast, bow deck, grit cache. Planks under a tailwind. A plank to a vent to the high lips and the exit | chunk 2, on the bow |

Chunk ids are `chunk_ch2_dust_{a..k}`.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Dust tide | `hazards[]` with `kind: "tide"`, `current` (px/s, + is right) | Pushes Mei while her body overlaps the band. Drawn as faint streaks drifting with the current |
| Vent | `kind: "tide"` with `lift` (px/s up), `period` (s), `phase` (0–1) | On for 45% of the beat. While on, Mei rises at `lift`. The column brightens when on. A puff at the mouth 12% before it starts |
| Sinking dust | `hazards[]` with `kind: "dust"` | Drawn over Mei. Slows her to 45% and caps her fall at 50 px/s. Less than 40 px deep, her air jump is back (the hop out). Head under: back to the last Moon Pool |
| Raft plank | `movers[]` with `kind: "raft"`, `axis: "x"` | One-way ride. Never hits |
| Raft deck | `platforms[]` with `asset: "raft"` | Static wreck deck |

Vent recipes:

- A vent from a dust crater teaches safely. If it is resting when Mei jumps in, she
  lands in shallow dust and hops back out.
- Two vents at `0` and `0.5` alternate. Ride A, wait on its lip, ride B.
- Steer into the column and stop. Walking straight through a narrow vent carries
  her out of it before it lifts her.

## Roster

Invented wildlife (not HP-bar folk):

| Id | Read |
| --- | --- |
| [crater crab](../../creatures/wildlife/crater-crab.md) | walks the lips sideways, digs in. Stomp it while it is up |
| [dust mite](../../creatures/wildlife/dust-mite.md) | pale dust cloud over the gaps. Dash still passes through |
| [star wisp](../../creatures/wildlife/star-wisp.md) | brighter, slower. Guards the vent tops |

## Item table

| Item | Notes |
| --- | --- |
| star_grit | 2.5 s boosted jump. On the lip before the widest gaps and in the wreck's grit cache. Comes back 5 s after pickup |
| mooncake | +1 heart. Over a plank, on a descent lip, beside the last lip |

No pantry carrots on this rung.

## Kit

| Kind | Stamp | Use |
| --- | --- | --- |
| crater (decor) | `story_crater` | Basin cross-section behind gaps and dust pools |
| raft mast (decor) | `story_mast` | Broken mast, torn sail, star lantern |
| raft plank / deck | `story_raft` | Bound planks with star studs |
| lip | `story_ground_moon` | Crater lips are ground slabs |

## Render notes

Palette `ch2_dust`: pale ash. Weather `dustMotes` (horizontal). Far layer
`story_far_dust`: crater rims, a tiny raft on a far rim, and the Silver River across
the sky. No falling snow.

## Editor

Environment → Chapter 2 → Dust Sea lists Dust tide, Sinking dust, Raft plank, Crater,
and Raft mast. Dust hazards show as pale boxes in Build. `lift`, `period`, and
`phase` are JSON-only for now. Copy JSON keeps them and the hazard kind.

## Endless status

Story Chapter 2 only.
