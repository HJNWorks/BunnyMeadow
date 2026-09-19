# Bunny Meadow — Platforms

Shared pad model for Story, Endless, and Bunny Jump. Meadow arcade stays top-down and
does not spawn these pads. Hub: [../GDD.md](../GDD.md). Break catalog:
[../editor/destructibility.md](../editor/destructibility.md). Caves:
[caves.md](caves.md). Bunny Jump:
[../modes/tasks/bunny-jump.md](../modes/tasks/bunny-jump.md).

A pad is not a one-off sprite. It is five axes on one object. Modes pick values. They
do not invent a second mover engine.

| Axis | What it answers |
| --- | --- |
| stamp | which existing tile (ground, log, bridge, lantern) |
| collision | how Mei meets it |
| motion | whether the pad itself moves |
| surface | what a landing does to Mei |
| break | how it weakens and falls |

Catalog of values: [catalog.md](catalog.md).

## Why this split

Story Cloud Stair already slides hanging bridges on `axis` / `amplitude` / `speed`.
River logs use the same mover. Bunny Jump needs that motion on vertical pads, plus
one-way collision and auto-bounce. If those stay as ad-hoc flags, the climb cannot
share the stair kit.

Sliding is motion, not a new stamp. Ice slick is a surface. One-bounce crumble is
break source `land`. A lantern boost is a surface. Those can stack: a sliding ice
pad that breaks after one bounce is legal.

## Today's JSON (live)

Story and Endless still store motion as a `movers[]` row, not as fields on a static
platform. That shape stays until a code pass flattens it.

```json
{
  "x": 420,
  "y": 640,
  "w": 180,
  "h": 16,
  "axis": "x",
  "amplitude": 40,
  "speed": 1.2,
  "tint": 13158624,
  "kind": "bridge"
}
```

Static platforms sit in `platforms[]`. Optional `break` is already on both.

## Target JSON (planned)

One pad object. Code later may keep `movers[]` as sugar for `motion.kind: slide`.

```json
{
  "x": 420,
  "y": 640,
  "w": 180,
  "h": 16,
  "stamp": "bridge",
  "collision": "one_way",
  "motion": { "kind": "slide", "axis": "x", "amplitude": 40, "speed": 1.2 },
  "surface": "default",
  "break": { "profile": "wood", "hp": 1, "sources": ["land"] }
}
```

No new workshop keys. Stamps stay `story_ground`, `story_log`, `story_bridge`,
`story_lantern`.

## Mode use

| Mode | Collision default | Motion | Surface | Status |
| --- | --- | --- | --- | --- |
| Story | solid | still, plus movers as slide | default. stair / log ride from standing on a mover | live movers. one_way planned |
| Endless | solid | same mover kit | default | live movers. stand-break not ticked yet |
| Bunny Jump | one_way | still, slide, optional vanish | bounce (auto), boost, slick | live. Vanish later. Same mover fields |
| Meadow | n/a | n/a | n/a | top-down. No pads |

Standing on a live slide already carries Mei (Cloud Stair, river). Bunny Jump reuses
that carry so a hopping pad does not slide out from under a bounce.

## What Bunny Jump still needs (code)

- Vanish pads
- Remaining jump roles: hop_ledge, drop_shot, stoop, column_swipe, ledge_charge, drift
- Bees / tortoise / boar debuts

Skip a second mover class. Skip carp. Skip new folk.
