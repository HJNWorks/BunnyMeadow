# Iteration I2 — Creatures and Items in Data

Goal: decouple enemies and items from fixed chunk spawns so each biome has its own roster and item
table. Hub: [README.md](README.md). Contract: [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

## Deltas

Data:

- `src/data/enemies.json`: add the biome and min-tier fields per creature from the roster table in
  [../creatures/README.md](../creatures/README.md); add any newly promoted creatures (goat first,
  it is already `planned`).
- New `src/data/items.json` (or a block in `endless.json`): the item catalog
  ([../items/catalog.md](../items/catalog.md)) and per-biome item tables
  ([../items/placement.md](../items/placement.md)).
- Chunks under `src/data/chunks/endless/`: add `enemySlots` and `itemSlots`; keep the old `enemies`
  and `carrots` fields readable during migration.

Code:

- `ChunkDef` in `src/systems/ChunkAssembler.ts`: add slot types; keep the old fields optional.
- `EndlessGenerator`: add the slot filler axis that draws a concrete creature and item per slot from
  the current biome roster and item table.
- `scripts/check-endless-chunks.mjs`: extend the gate to validate slots (position in bounds, `allow`
  archetypes exist, `minTier` in 1-5).

## Graduates to live

- [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md): slots and the slot filler.
- [../creatures/README.md](../creatures/README.md): biome rosters become data-backed.
- [../items/README.md](../items/README.md): the first non-carrot items (mooncake, osmanthus blossom,
  lantern) become live, including the lantern mist push.

## Deferred

- New hazard and mover kinds (wind, void, shaft) unless a promoted creature needs one.
- Skinnable layouts (still one biome per layout file until I3 or later).

## Ship

Build gate passes; ship to Pages; tag a minor version (new content).
