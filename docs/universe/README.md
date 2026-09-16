# Bunny Meadow — The Universe

This is the world model. It explains how every environment in the game is derived
from one story: Mei's climb from the burrow to the moon on the night of the
Mid-Autumn Festival. Hub: [../GDD.md](../GDD.md). Narrative: [../STORY.md](../STORY.md).
Folklore backing: [../LORE.md](../LORE.md).

The universe is not a set of unrelated levels. It is a single vertical journey,
"the Ladder", cut into rungs. Story mode walks the canonical rungs in order.
Endless walks a seeded route through the same rungs. Meadow and Moon Tasks borrow
individual rungs as backdrops.

## The Ladder

One night, one ascent. The rungs, low to high:

| Rung | Environment | Altitude | Hour | Status |
| --- | --- | --- | --- | --- |
| 0 | Burrow Tunnels | underground | afternoon | planned |
| 1 | Meadow | ground | afternoon | live |
| 2 | Orchard | low hills | golden hour | live |
| 3 | Bamboo Grove | hills | dusk | live |
| 4 | Riverbank | valley floor | dusk | live |
| 5 | Lantern Village | foothill town | night | live |
| 6 | Osmanthus Peak | mountain | deep night | live |
| 7 | Cloud Sea | sky | deep night | live (Story) |
| 8 | Moon Garden | moon | eternal night | live |

Riverbank sits at a valley floor between hills and foothills: the climb dips to
cross water before rising to the festival town. That dip is deliberate and lets the
route double back (see [biome-graph.md](biome-graph.md)).

## The five axes

Every environment is defined by five axes. Palette, weather, creature roster and
item table are read off these axes, not chosen per level. This keeps a new rung
consistent by construction.

| Axis | Values (low to high) |
| --- | --- |
| Altitude | underground, ground, low hills, hills, valley, town, mountain, sky, moon |
| Hour | afternoon, golden hour, dusk, night, deep night, eternal night |
| Lore anchor | which [LORE.md](../LORE.md) entry lives on this rung |
| Movement verb | run, jump, wall bounce, log ride, tiger ride, glide, stair climb, low gravity |
| Hazard vocabulary | gaps, shafts, current, wind, void |

Derivation rules:

- Altitude and hour set the palette band and the sky token in [../rendering/palettes.md](../rendering/palettes.md).
- Hour sets whether the night lighting overlay is active in [../rendering/effects.md](../rendering/effects.md).
- The lore anchor decides which folk NPC or boss can appear ([../creatures/folk/](../creatures/folk/)).
- The movement verb is the one skill a rung teaches, and it gates the minimum
  chunk tier that rung can present ([../creatures/abilities.md](../creatures/abilities.md)).
- The hazard vocabulary decides which mover and hazard kinds a chunk on this rung
  may use, and which wildlife feels at home ([../creatures/README.md](../creatures/README.md)).

## How the modes read the Ladder

| Mode | Route through the Ladder |
| --- | --- |
| Story | Fixed. World 0 = rung 0/1 stations, World 1 = rungs 1-2, World 2 = rungs 3-4, World 3 = rungs 5-6, World 4 = rung 7, finale = rung 8. See [../WORLDS.md](../WORLDS.md). |
| Endless | Seeded. A route walker steps between adjacent rungs; band lengths and altitude weighting come from difficulty. See [../modes/endless/design.md](../modes/endless/design.md). |
| Meadow (arcade) | Single rung as a top-down backdrop, chosen by map. |
| Moon Tasks | Single rung, reusing Meadow backdrops. |

## Pages in this section

- [biome-graph.md](biome-graph.md) - the rungs as a graph: which rungs connect, the
  bridge chunk on each edge, and the rules the Endless route walker follows.
- [timeline.md](timeline.md) - the one night as a clock: where each world and each
  Endless band sits in time, so hour transitions stay coherent.
- [environments/](environments/) - one page per rung with its five axes filled in,
  its roster, item table, and render notes.
