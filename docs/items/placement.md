# Bunny Meadow — Item Placement

How items reach the field: item slots in chunks, biome item tables that weight them, and
the special case of the lantern pushing back the Endless mist. Hub: [README.md](README.md).
Chunk schema: [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

## Slots (live, I2)

Chunks declare `itemSlots`. Legacy `carrots` arrays remain and are treated as currency
slots if `itemSlots` is missing.

```json
"itemSlots": [
  { "x": 380, "y": 840, "allow": ["currency"], "minTier": 1 },
  { "x": 620, "y": 520, "allow": ["run-buff", "restore"], "minTier": 3 }
]
```

`EndlessGenerator.fill` rolls each slot against the current biome's item table in
`src/data/items.json`. `carrotChance` is the chance the slot fills. An empty roll leaves
the slot empty.

Tier 3+ layouts converted from old carrot positions also allow `restore` and `run-buff`
so mooncakes, blossoms, and lanterns can appear.

## Biome item tables (live)

Weights are numbers (high 10, medium 6, uncommon 3, rare 1):

| Biome | carrot | mooncake | blossom | lantern |
| --- | --- | --- | --- | --- |
| meadow | 10 |  |  |  |
| orchard | 10 | 1 |  |  |
| bamboo | 10 |  |  | 1 |
| riverbank | 10 | 1 |  |  |
| lantern | 10 | 1 |  | 3 |
| osmanthus | 6 | 1 | 3 |  |

A slot's `allow` list intersects the table: only items in both can appear.

## The lantern and the mist wall

On pickup, Endless moves the chase wall back 80 m (`mistPushMeters` in `items.json`),
clamped so the wall cannot pass behind the run start. Light radius waits for I3. The HUD
shows a short line when the wall recedes.
