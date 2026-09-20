# Bunny Meadow — Web Iterations

Story milestones M0-M5 are done. Desktop and store milestones (M6-M8) are postponed while the
web build keeps improving. Ongoing web work is tracked here as numbered iterations. Build order
and the milestone list stay in [../ROADMAP.md](../ROADMAP.md).

## Scheme

- An iteration is a small, shippable batch of web changes with its own page.
- Each page lists the data and doc deltas and the design pages whose `planned` facts graduate to
  `live` when it ships.
- Iterations ship to Pages one at a time (the "ship to Pages after each change that touches the
  playable build" rule).
- Iterations do not renumber milestones. M6-M8 keep their numbers and sit at the end of the
  roadmap.

## The current track

| Iteration | Theme | Turns these `planned` into `live` |
| --- | --- | --- |
| I0 (done) | Repo hygiene | LICENSE, CONTRIBUTING, CHANGELOG, CI on PRs, Conventional Commits, `v0.1.0` |
| [I1](i1-biome-route.md) (done) | Biome route and shorter bands | route walker, `bandMeters`, tier jitter |
| [I2](i2-creatures-items.md) (done) | Creatures and items in data | enemy/item slots, biome rosters, item catalog |
| [I3](i3-theme-rendering.md) (done) | Theme and rendering | palettes.json, sky lerp, weather, night lighting |
| [I4](i4-audio-i18n.md) (done) | Audio and i18n | the remaining open M5 items |
| [I5](i5-bunny-jump.md) (done) | Bunny Jump under Moon Tasks | climb scene, one-way bounce, local best |
| [I6](i6-chapter1-docs.md) (current) | Chapter 1 docs lock | lore gates, station briefs, I7-I10 shells |
| [I7](i7-w0-pool.md) | Moon in the Pool + Soft Paws | controls map, creature intro |
| [I8](i8-w1-w2-density.md) | Meadow through river | density, Path ids, dew, mooncakes |
| [I9](i9-festival-cloud-stair.md) | Festival + Cloud Stair | lantern village, frost hare, Earth gravity |
| [I10](i10-guanghan-palace.md) | Guanghan palace walk | walk, proximity Han, far layer |

## Relationship to milestones

```mermaid
flowchart LR
  m5["M5 done"] --> i1
  i1[I1] --> i2[I2]
  i2 --> i3[I3]
  i3 --> i4[I4]
  i4 --> i5[I5]
  i5 --> i6[I6 docs lock]
  i6 --> i7[I7]
  i7 --> i8[I8]
  i8 --> i9[I9]
  i9 --> i10[I10]
  i10 --> m6["M6 desktop (postponed)"]
  m6 --> m7["M7 store (postponed)"]
  m7 --> m8["M8 release (postponed)"]
```

The desktop and store milestones resume after the web build is where it should be. See the
transfer notes in [../ROADMAP.md](../ROADMAP.md) for what carries into Electron unchanged.
