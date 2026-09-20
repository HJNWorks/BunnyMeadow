# Environment — Meadow

Status: live. The starting rung of the Ladder and the game's default backdrop. Hub:
[../README.md](../README.md). Palette tokens: [../../rendering/palettes.md](../../rendering/palettes.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | ground |
| Hour | afternoon |
| Lore anchor | Burrow home, the Mid-Autumn setting ([../../LORE.md](../../LORE.md#mid-autumn-festival-中秋節)) |
| Movement verb | run, jump, dash |
| Hazard vocabulary | gaps |

## Feel

Soft grass, the burrow entrance, carrots in the open. Teaching run, jump, and dash
lives on Moon in the Pool. Meadow then carries the first creatures (hedgehog,
fox, bees). Gaps stay short and forgiving. Fireflies at dusk around the pond.
One keepsake on the Pool map. No generic heart pickup.

## Roster

Home wildlife (see [../../creatures/wildlife/](../../creatures/wildlife/)):

| Creature | Class | Active hour | Min tier |
| --- | --- | --- | --- |
| fox | chaser | afternoon | 1 |
| hedgehog | patrol | afternoon | 1 |
| crow | ranged_lob | afternoon | 2 |
| bees | swarm | afternoon | 2 (Soft Paws) |
| tortoise | patrol | afternoon | 1 (Soft Paths) |
| firefly | visual | dusk | 1 (planned) |

Folk: Fox Hu appears here as the World 1 cart-chase boss ([../../creatures/folk/fox-hu.md](../../creatures/folk/fox-hu.md)).

## Item table

See [../../items/placement.md](../../items/placement.md) for the slot mechanism.

| Item | Weight | Notes |
| --- | --- | --- |
| carrot | high | currency, the staple |
| dew | low | short slow-time buff (Soft Paths) |
| mooncake | rare | restores one heart on Earth Story (Soft Paths) |
| osmanthus seed | one per station | keepsake. Never respawns |

## Chunk usage

- Story: Moon in the Pool, Soft Paws, 1-1 Soft Paths, 1-3 Cart Chase ([../../WORLDS.md](../../WORLDS.md)).
- Endless: `endless_meadow_t1_a/b`, `endless_meadow_t2_a/b`, plus `endless_start`.
- Meadow arcade map: `meadow_home`.

## Render notes

Warm afternoon sky (`#c5d48a` today in `src/data/endless.json`). No night overlay.
Weather preset: pollen. See [../../rendering/effects.md](../../rendering/effects.md).
