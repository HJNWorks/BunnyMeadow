# Environment — Riverbank

Status: live. The fourth rung: the valley floor where the climb dips to cross water
at dusk. This is the "water region" a player currently cannot reach in Endless (it
starts at 1200 m by distance while runs end near 145 m). The route walker in
[../biome-graph.md](../biome-graph.md) makes it reachable early. Hub: [../README.md](../README.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | valley floor (a dip between hills and town) |
| Hour | dusk |
| Lore anchor | Heron Fisher, an invented river antagonist ([../../LORE.md](../../LORE.md)) |
| Movement verb | log ride, current reading |
| Hazard vocabulary | current, gaps |

## Feel

Logs, current, rafts. Water spans are crossed on drifting logs that move on the x or
y axis. Falling into water costs a heart and respawns ahead. The current pushes the
player, so timing a log ride matters. Mooncakes on logs. Grove-to-river edge from
Green Corridor so 2-2 is the same valley.

## Roster

| Creature | Class | Active hour | Min tier |
| --- | --- | --- | --- |
| frog | patrol | dusk | 2 (Green Corridor) |
| carp | water_patrol | dusk | 3 (Floating Logs) |
| heron | reach | dusk | 3 (Floating Logs poke. Raft boss stays folk) |
| crow | ranged_lob | dusk | 3 |

Folk: Heron Fisher, the World 2 boss ([../../creatures/folk/heron-fisher.md](../../creatures/folk/heron-fisher.md)).

## Item table

| Item | Weight | Notes |
| --- | --- | --- |
| carrot | high | currency, often placed on logs |
| mooncake | rare | restores one heart, valuable given water damage |
| osmanthus seed | one per station | keepsake |

## Chunk usage

- Story: 2-2 Floating Logs, 2-3 Raft Gauntlet.
- Endless: `endless_riverbank_t2_a/b`, `endless_riverbank_t3_a/b`, `endless_riverbank_t4_a/b`.

## Render notes

Cool water sky (`#6b94a0` today). Water is a hazard with a `current` value; see the
`water` hazard kind in [../../modes/endless/chunk-contract.md](../../modes/endless/chunk-contract.md).
Weather preset: drizzle. Mist reflections on water are an idea for [../../rendering/effects.md](../../rendering/effects.md).
