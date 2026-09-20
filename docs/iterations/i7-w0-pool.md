# Iteration I7 — Moon in the Pool and Soft Paws

Status: live. Hub: [README.md](README.md). Design:
[../story/chapter1-overhaul.md](../story/chapter1-overhaul.md).

Moon in the Pool is a playable controls map. Station id stays `w0_lore_moon`. Soft Paws
drops the tutorial flag and introduces hedgehog, fox, and bees. The Pool map opens with
a short burrow-tunnels lead-in (root lifts, no chase), then grass, one Moon Pool, and a
tiny exit. First osmanthus seed is hidden on the pond chunk.

Saves that already cleared `w0_lore_moon` as lore keep that clear. They do not replay
the new map. No folklore without a [LORE.md](../LORE.md) row. I8 density stays out.

## Deltas

- `w0_lore_moon` is `kind: level` with `levelId` `w0_lore_moon`
- Chunks `chunk_pool_tunnel` and `chunk_pool_pond`
- `tutorial: true` on Pool. Soft Paws no longer floats the chips
- Bees on `chunk_paws_jump`. Editor Path roster includes bees, tortoise, boar
- `progress.story.keepsakes`. `KEEPSAKE_FIRST`. First seed unlocks the blossom accessory
- Chang'e line is the Moon Pool ticker (`change.pool.w0_lore_moon`)

## Still later

I8 meadow through river density. More seeds per station. Eight-seed and full-set
achievements. Dew. Han moon collider.

## Ship

Pages updates when the files land on `main`. No `package.json` bump.
