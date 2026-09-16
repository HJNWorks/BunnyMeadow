# Bunny Meadow — Item Placement

How items reach the field: item slots in chunks, biome item tables that weight them, and
the special case of the lantern pushing back the Endless mist. Hub: [README.md](README.md).
Chunk schema: [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

## Today

Chunk JSON carries a fixed `carrots` array, for example in
`src/data/chunks/endless/endless_riverbank_t3_a.json`:

```json
"carrots": [{ "x": 380, "y": 840 }]
```

The Endless generator rolls each with a single `carrotChance` per difficulty
(`rollCarrot` in `src/modes/endless/EndlessGenerator.ts`). There is no other item and no
weighting by biome.

## Planned: item slots

A chunk declares item slots instead of a fixed carrot list. A slot names a position and
which categories may fill it, and a minimum tier so a buff does not appear before it is
useful.

```json
"itemSlots": [
  { "x": 380, "y": 840, "allow": ["currency"], "minTier": 1 },
  { "x": 620, "y": 520, "allow": ["run-buff", "restore"], "minTier": 3 }
]
```

The generator fills each slot by rolling against the current biome's item table. An
empty roll leaves the slot empty, which keeps runs varied.

## Planned: biome item tables

Each biome declares weights per item. This replaces the single `carrotChance`. The
tables live on the environment pages under [../universe/environments/](../universe/environments/)
and would be authored into `src/data/endless.json` (or a new `items.json`).

Example (Lantern Village):

| Item | Weight |
| --- | --- |
| carrot | high |
| lantern | uncommon |
| mooncake | rare |

A slot's `allow` list intersects with the biome table: only items in both the slot's
categories and the biome's table can appear there.

## The lantern and the mist wall

The Endless chase is a mist wall that trails the player and speeds up with distance
(difficulty tuning in [../modes/endless/tuning.md](../modes/endless/tuning.md)). The
lantern item is the one pickup that interacts with it: on use it pushes the wall back a
fixed number of metres and lights a radius for a timed window. This gives a losing run a
recoverable moment without changing any permanent stat, staying inside the no-power-creep
rule.

Placement guidance: lantern slots sit slightly off the fastest line, so taking one costs
a little distance in exchange for the push, keeping the choice honest.
