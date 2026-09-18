# Destructibility

How objects weaken and fall apart. Hub: [README.md](README.md). Chunk schema lives on
assembled platforms, walls, movers, and decor as an optional `break` field. Profiles
live in `src/data/breakables.json` so later sources (dash hits, projectiles, timers)
can share the same cracks without a new engine.

Family tone: the object splits and is gone. No gore. A restart or station reload
puts it back.

## Object field

```json
"break": {
  "profile": "stone",
  "hp": 5,
  "sources": ["beam"]
}
```

| Field | Meaning |
| --- | --- |
| `profile` | Key into `breakables.json`. Required. |
| `hp` | Seconds of matching damage before the object is gone. Omit to use the profile default. |
| `sources` | Which damage kinds count. Omit to use the profile list. |

No `break` field means the object is solid forever. The story map editor Selection
panel can toggle Destructible and pick a profile on platforms, walls, bridges, logs,
and decor. Copy keeps the field.

## Profile map

| Profile | Default hp | Sources | Crack look | Shipped on |
| --- | --- | --- | --- | --- |
| stone | 5 s | beam | jagged surface splits | Guanghan green ledges |
| wood | 5 s | stand, beam | grain splits along the slab | Soft River logs |
| ice | 3 s | beam, stand | radial frost lines | none yet (reserved) |

Add a profile by appending to `src/data/breakables.json` and drawing a matching
crack sheet (`stone` / `wood` / `ice` stages 1-3). Do not invent a fourth crack
kind until the sheet exists.

## Damage sources (live)

| Source | When it counts |
| --- | --- |
| beam | Han's last-heart lunar beam, while the hot slab stays on that object. Last-heart beam lasts 5.5 s so one lock can finish a 5 s stone ledge. |
| stand | Mei standing on the object (logs over water). Time adds only while her feet stay on it. |

Damage keeps its cracks if the source leaves. A second lock or a later stand
finishes the remaining hp.

Three crack stages before it falls: hairline (under 1/3), open (1/3 to 2/3),
ready to go (over 2/3). Then the collider turns off and a few fragments drop.
Reduced motion keeps one mark and skips fragments.

## What does not break yet

The wide Guanghan floor is not marked. Walls and roofs stay cover unless an editor
sets Destructible on them. Endless river logs can carry a `break` field in JSON.
The Endless runner does not tick stand damage yet. Decor can store the field.
Decor has no collider, so it will not take beam or stand hits until that collider
exists. Dash hits and thrown spears are not sources yet.

## Play notes

Hiding from Han's last beam behind a destructible ledge only lasts until that
ledge's 5 s is up. After it falls the beam can reach the next surface. River logs
that break drop Mei into the water (heart, then retry). Editor Build does not
run damage. Editor Play does.
