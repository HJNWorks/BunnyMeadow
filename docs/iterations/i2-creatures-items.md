# Iteration I2 — Creatures and Items in Data

Status: done (unreleased, still 0.1.0). Hub: [README.md](README.md). Contract:
[../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

## Shipped

Data:

- `src/data/enemies.json`: `homeBiomes` and `minTier` on fox, hedgehog, crow. Goat added
  as `blocker` (bamboo, osmanthus, minTier 3).
- `src/data/items.json`: catalog (carrot, mooncake, osmanthus blossom, lantern) and
  per-biome weights. Lantern mist push is 80 m.
- Endless chunks carry `enemySlots` and `itemSlots` derived from the old `enemies` /
  `carrots` arrays. Those arrays remain.

Code:

- `ChunkDef` slots in `src/systems/ChunkAssembler.ts`.
- `EndlessGenerator.fill` picks creatures from the biome roster and items from the biome
  table. Empty item rolls use `carrotChance`. If no archetype match exists for the
  current biome, the filler falls back to any roster creature that lives there.
- `scripts/check-endless-chunks.mjs` validates slot bounds, `allow` lists, and `minTier`.
- Play: mooncake restores a heart. Blossom grants one extra glide charge. Lantern pushes
  the mist wall back 80 m. Goat is a thin blocker (charge, stun on wall).

## Graduated to live

- [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md): slots and filler.
- [../creatures/README.md](../creatures/README.md): biome rosters in `enemies.json`.
- [../items/README.md](../items/README.md): mooncake, blossom, lantern (mist push + glow).

## Still later

- One layout serving many biomes.
- Squirrel, heron, owl, cat, carp, bees, dew, moon letter.
