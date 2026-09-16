# Environment — Lantern Village

Status: live. The fifth rung: a foothill festival town at night. Hub: [../README.md](../README.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | foothill town |
| Hour | night |
| Lore anchor | Mid-Autumn festival, Tu'er Ye / Lord Rabbit ([../../LORE.md](../../LORE.md#tuer-ye--lord-rabbit-兔兒爺)) |
| Movement verb | glide (hold jump) |
| Hazard vocabulary | gaps |

## Feel

Festival stalls and lanterns. The rung that grants the glide: hold jump to float
across long gaps. Full night, warm lantern light against a dark sky. The lantern
item is thematically native here (see [../../items/catalog.md](../../items/catalog.md)).

## Roster

| Creature | Class | Active hour | Min tier |
| --- | --- | --- | --- |
| cat | reach | night | 3 |
| owl | diver | night | 3 |
| crow | ranged_lob | night | 4 |

Owls are ordinary night enemies only, never Moon servants ([../../LORE.md](../../LORE.md#cranes-as-immortal-messengers)).

Folk: Tu'er Ye lends the tiger for the ascent ([../../creatures/folk/tuer-ye.md](../../creatures/folk/tuer-ye.md)).

## Item table

| Item | Weight | Notes |
| --- | --- | --- |
| carrot | high | currency |
| lantern | uncommon | native here: light radius + pushes the mist back |
| mooncake | rare | restores one heart |

## Chunk usage

- Story: 3-1 Paper Lights, 3-2 Tiger Road.
- Endless: `endless_lantern_t3_a/b`, `endless_lantern_t4_a/b`, `endless_lantern_t5_a/b`.
- Meadow arcade map: `festival_yard` (pantry 4).

## Render notes

Night sky (`#3d4560` today). Night lighting overlay active with lantern light
radii. Weather preset: fireflies and lantern ash.
