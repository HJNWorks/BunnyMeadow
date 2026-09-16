# Endless — Chunk Contract

The JSON contract every streamed chunk obeys, and the slot and skin extensions the design
needs. Hub: [design.md](design.md). Source of truth: `src/systems/ChunkAssembler.ts` and
`scripts/check-endless-chunks.mjs`.

## Today's contract

A chunk is one JSON file under `src/data/chunks/endless/`, glob-registered into
`ENDLESS_CHUNKS`. The `ChunkDef` type:

```json
{
  "id": "endless_riverbank_t3_a",
  "width": 960,
  "height": 1080,
  "groundY": 980,
  "platforms": [{ "x": 0, "y": 980, "w": 240, "h": 100 }],
  "walls": [],
  "enemies": [{ "id": "crow", "x": 480, "y": 560 }],
  "movers": [{ "x": 300, "y": 900, "w": 130, "h": 28, "axis": "x", "amplitude": 55, "speed": 1.2, "tint": 10066176 }],
  "hazards": [{ "x": 240, "y": 1000, "w": 480, "h": 80, "kind": "water", "current": 30 }],
  "carrots": [{ "x": 380, "y": 840 }],
  "endless": { "env": "riverbank", "tier": 3, "entryY": 980, "exitY": 980 },
  "color": "#6b94a0"
}
```

| Field | Meaning |
| --- | --- |
| id | unique chunk id, named `endless_<env>_t<tier>_<a\|b>` today |
| width, height, groundY | chunk box and ground line |
| platforms, walls | static collision rects |
| enemies | fixed enemy spawns by id (only fox, hedgehog, crow exist) |
| movers | drifting platforms on the x or y axis with amplitude, speed, tint |
| hazards | currently only `kind: "water"` with an optional `current` push |
| carrots | fixed carrot pickups |
| endless.env, endless.tier | biome and tier, both baked into the id |
| endless.entryY, endless.exitY | ground height at the left and right pads for continuity |
| color | fallback fill colour |

The build gate `scripts/check-endless-chunks.mjs` validates the entry and exit pad contract
so consecutive chunks always connect.

## Why it needs extending

Two couplings block the design in [design.md](design.md):

1. `enemies` names fixed ids, so a biome cannot vary its mobs and enemy-per-biome rosters
   are impossible.
2. `endless.env` is baked into the file and the id, so a layout is welded to one biome and
   cannot be reskinned.

## Slots (live, I2)

Chunks declare `enemySlots` and `itemSlots`. The generator fills them from the biome
roster and item table. Legacy `enemies` and `carrots` stay on disk and are treated as
slots if the new fields are missing.

```json
{
  "enemySlots": [
    { "x": 480, "y": 560, "allow": ["ranged_lob"], "minTier": 2 }
  ],
  "itemSlots": [
    { "x": 380, "y": 840, "allow": ["currency", "restore", "run-buff"], "minTier": 1 }
  ]
}
```

- An enemy slot names a position, which archetypes may fill it, and a minimum tier.
- The generator picks a creature whose home biome, archetype, and min tier match. If none
  match the archetype, it falls back to any roster creature for that biome.
- Item slots roll against the biome table in `src/data/items.json`. `carrotChance` is the
  chance the slot fills at all. Empty rolls stay empty.
- I3 tints wash and grass from the biome palette. One layout serving many biomes is still
  later.

## Planned extension: skinnable layouts

Split the layout from the biome so one file can serve several rungs:

- `endless.env` becomes a list of `allowEnvs` (or is dropped from the file and supplied by
  the route walker at assembly time).
- `color` and any tint default come from the biome palette
  ([../../rendering/palettes.md](../../rendering/palettes.md)) rather than the file.
- Ids move to `layout_t<tier>_<letter>` and the biome is a runtime pick, so a tier-3 layout
  can appear as bamboo, riverbank or lantern where the hazard vocabularies match.

The hazard vocabulary per rung in [../../universe/biome-graph.md](../../universe/biome-graph.md)
decides which layouts are legal on which rung: a layout with a `water` hazard can only skin
onto riverbank, a layout with `wind` movers only onto osmanthus or cloudsea.

## New hazard and mover kinds (planned)

The current `kind` enum is `water` only. The hazard vocabulary implies more:

| kind | Rungs | Status |
| --- | --- | --- |
| water | riverbank | live |
| wind | osmanthus, cloudsea | planned |
| void | tunnels, osmanthus, cloudsea, moon | planned (fall-through with soft respawn) |
| shaft | bamboo | planned (falling bamboo mover) |

Each new kind is new code, so it earns a doc entry here and a check in the build gate.
