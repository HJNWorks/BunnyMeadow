# Bunny Meadow — Worlds and Environments

Story first release: 3 worlds x 3 levels plus moon finale. Hub is the burrow.

## Environment kits

Shared by Meadow, Story, Tasks, Endless. Each kit: tileset, palette, parallax layers, ambient audio, weather.

| Id | Name | Time of day | Notes |
| --- | --- | --- | --- |
| meadow | Meadow | day | Soft grass, burrow entrance, carrots |
| orchard | Orchard | day | Fruit trees, fences |
| bamboo | Bamboo Grove | dusk | Tall stalks, falling shafts |
| riverbank | Riverbank | dusk | Logs, current, rafts |
| lantern | Lantern Village | night | Festival stalls, lanterns |
| osmanthus | Osmanthus Peak | night | Wind, blossom fall, tiger path |
| moon | Moon Garden | eternal night | Low gravity, Guanghan Palace, Wu Gang's tree |

## Story path map

Story opens on an HTML/SVG landscape path from burrow toward the moon. Worlds are nodes. Expanding a live world shows its stations. Locked later worlds stay visible as dim nodes.

Path progress today: Worlds 1–3 each expose two clearable stations (Soft Paths, Hedge Maze, Green Corridor, Floating Logs, Paper Lights, Tiger Road). Boss stations and Guanghan stay Soon. Clearing both playable stations of a world unlocks the next.

### World 0 — Burrow Eve

| Station | Kind | Notes |
| --- | --- | --- |
| Burrow Eve | lore | Mid-Autumn setting |
| Moon in the Pool | lore | Chang'e through water |
| Soft Paws | controls | Move, jump, dash, pause |

Unlocks Soft Paths when complete. Station ids are stored in `progress.story.cleared`.

### World 1 — Meadow and Hedgerows

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 1-1 Soft Paths | meadow | run, jump, dash | Moon Pool | live |
| 1-2 Hedge Maze | orchard | wall bounce, crow lob | Moon Pool | live |
| 1-3 Cart Chase | meadow | boss: Fox Hu cart | World clear | soon |

### World 2 — Bamboo Grove and River

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 2-1 Green Corridor | bamboo | wall jump | Moon Pool | live |
| 2-2 Floating Logs | riverbank | log ride, current | Moon Pool | live |
| 2-3 Raft Gauntlet | riverbank | boss: Heron Fisher | World clear | soon |

### World 3 — Lantern Village and Osmanthus Peak

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 3-1 Paper Lights | lantern | lantern glide | Moon Pool | live |
| 3-2 Tiger Road | osmanthus | tiger ride (Tu'er Ye) | Moon Pool | live |
| 3-3 Crane Summit | osmanthus | boss: Crane Envoy | Ride to moon | soon |

### Finale

| Level | Env | Teach | Exit |
| --- | --- | --- | --- |
| M-1 Guanghan | moon | low gravity, quiet platforming | Dialogue + epilogue |

## Meadow maps (arcade)

JSON maps: obstacles, spawn points, safe zone, decorations. All four ids below ship as files under `src/data/maps/`.

| Id | Env | Unlock |
| --- | --- | --- |
| meadow_home | meadow | default |
| orchard_rows | orchard | pantry 2 |
| bamboo_clearing | bamboo | pantry 3 |
| festival_yard | lantern | pantry 4 |

## Map formats

- Meadow: `src/data/maps/*.json`
- Story: Tiled `.tmj` under `public/assets/tilemaps/`, assembled from chunk prefabs so Endless can reuse them
- Chunk ids mirror environment kits (`chunk_meadow_a`, `chunk_bamboo_gap`, ...)

## Day / night and weather

Story levels lock time of day per world. Meadow can offer day and dusk variants. Weather (pollen, drizzle, blossom fall, lantern ash) is a system flag on the env kit, not a separate engine.
