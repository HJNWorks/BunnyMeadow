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

Festival stalls, hanging lantern strings, fireflies as weather (already the preset),
sparkler and firework bursts as background VFX. Not a fire kit. Not Han's job. The
rung that grants the glide: hold jump to float across long gaps. Full night, warm
lantern light against a dark sky. The lantern item is thematically native here (see
[../../items/catalog.md](../../items/catalog.md)). Cat, owl, and lantern moth sit on
Paper Lights. Paper Lights is longer than Tiger Road or Crane Summit.

## Roster

| Creature | Class | Active hour | Min tier |
| --- | --- | --- | --- |
| cat | reach | night | 3 (Paper Lights) |
| owl | diver | night | 3 (Paper Lights) |
| crow | ranged_lob | night | 4 |
| lantern moth | diver | night | 3 (Paper Lights. Palace halls I10) |
| firefly | visual | night | weather live. Pickup optional |

Owls are ordinary night enemies only, never Moon servants ([../../LORE.md](../../LORE.md#cranes-as-immortal-messengers)).

Folk: Tu'er Ye lends the tiger for the ascent ([../../creatures/folk/tuer-ye.md](../../creatures/folk/tuer-ye.md)).

## Item table

| Item | Weight | Notes |
| --- | --- | --- |
| carrot | high | currency |
| lantern | uncommon | native here: light radius + pushes the mist back |
| mooncake | rare | restores one heart |
| sparkler | uncommon | lantern-class timed light. Not a weapon |
| osmanthus blossom | uncommon | extra glide |
| osmanthus seed | one per station | keepsake |

## Chunk usage

- Story: 3-1 Paper Lights. Tiger Road shares the tiger path, not this village density.
- Endless: `endless_lantern_t3_a/b`, `endless_lantern_t4_a/b`, `endless_lantern_t5_a/b`.
- Meadow arcade map: `festival_yard` (pantry 4).

## Render notes

Night sky (`#3d4560` today). Night lighting overlay active with lantern light
radii. Weather preset: fireflies and lantern ash. Sparkler bursts as scenery VFX.
