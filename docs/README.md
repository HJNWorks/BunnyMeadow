# Bunny Meadow — Documentation Index

This folder is the design and build source of truth for Bunny Meadow, a family-tone
woodland game about a rabbit kit named Mei climbing from her burrow to the moon on
one Mid-Autumn night. Readers here are not assumed to have the codebase open. Every
page opens with what it is and links back to its hub.

## Reading order

1. [GDD.md](GDD.md) - what the game is, modes, scope guards.
2. [STORY.md](STORY.md), [story/chapters.md](story/chapters.md), and [LORE.md](LORE.md) - the climb, chapter layer, and folklore ledger.
3. [universe/README.md](universe/README.md) - the Ladder: how every environment is derived from the story.
4. [creatures/README.md](creatures/README.md) - the bestiary: wildlife, folk, kits.
5. [items/README.md](items/README.md) - collectibles and their rules.
6. [platforms/README.md](platforms/README.md) - shared pad axes (collision, motion, surface, break).
7. [modes/endless/design.md](modes/endless/design.md) - how Endless turns the universe into infinite runs.
8. [modes/tasks/README.md](modes/tasks/README.md) - Moon Tasks hub (Bunny Jump live).
9. [rendering/README.md](rendering/README.md) - the visual and animation language.
10. [ROADMAP.md](ROADMAP.md) and [iterations/README.md](iterations/README.md) - build order and the web iteration track.

## Map of the tree

```
docs/
  README.md            this index
  GDD.md               game design overview (hub)
  STORY.md             narrative spine (Chapter 1 live)
  story/
    chapters.md        Chapter 1 live, Chapter 2 first stations, Chapter 3 West of Silver planned
    chapter1-overhaul.md  Chapter 1 docs lock (I6). Station briefs, lore gates
    chapter2-map-prompt.md  paste-ready Chapter 2 painting prompt
    chapter3-map-prompt.md  paste-ready Chapter 3 painting prompt
    proximity.md       contact vs proximity vs volume triggers
  editor/
    README.md          story map editor
    destructibility.md break profiles, beam/stand/land damage, crack stages
  LORE.md              folklore ledger (canon / adapted / invented)
  WORLDS.md            story path map (hub into universe/environments)
  ENEMIES.md           enemy data schema (hub into creatures/)
  UI.md                screen flow, save schema, HUD, input
  STEAM.md             platform and store notes
  ROADMAP.md           milestones + web iteration track
  universe/            the derived world model
    README.md          the Ladder and the five axes
    biome-graph.md     environment nodes, edges, bridges, endless route
    timeline.md        where every mode and world sits in the one night
    environments/      one page per environment kit (guanghan-palace.md splits walk vs court)
  creatures/           the bestiary
    README.md          index + creature classes
    abilities.md       player verbs and item interactions
    voices.md          creature lines and voice file ids
    wildlife/          one page per enemy
    folk/              lore NPCs and bosses
    kits/              Mei, Yue, the burrow family
  items/               collectibles
    README.md          categories and rules
    catalog.md         one entry per item
    placement.md       item slots and biome tables
  platforms/           shared pad model
    README.md          five axes (stamp, collision, motion, surface, break)
    catalog.md         values, stacking, mode use
  modes/endless/       Endless design detail
    design.md          seeded route, tiers, slots, skins
    chunk-contract.md  the chunk JSON contract and its extensions
    tuning.md          per-difficulty tables and findings
  modes/tasks/         Moon Tasks
    README.md          hub
    bunny-jump.md      vertical hop (live)
  rendering/           the visual language
    README.md          decision list with status
    palettes.md        per-biome palette tokens
    effects.md         weather, lighting, mist
    animation.md       frame budgets, telegraphs, squash/stretch
    performance.md     atlas and draw-call budgets
  iterations/          web iteration track (post-M5)
    README.md          scheme
    i1-biome-route.md .. i10-guanghan-palace.md
```

## Status vocabulary

Every element in these docs carries one status so a reader can tell design from code.

| Status | Meaning |
| --- | --- |
| live | Implemented in `src/` today |
| planned | Committed to a numbered iteration, not yet in `src/` |
| idea | Brainstorm, not scheduled |

Folklore elements additionally carry a LORE status (canon / adapted / invented /
forbidden) from [LORE.md](LORE.md). No folklore name appears anywhere without an
entry there.

## Versioning rules

- Story milestones M0-M5 are done. Web iterations I1-I4 are done (`v0.2.0`). I5 is
  Bunny Jump live. I6 is the Chapter 1 docs lock. I7 is Moon in the Pool live. I8 is
  meadow through river live. I9 is festival and Cloud Stair live. Current track is I10
  Guanghan palace walk. The remaining desktop and store milestones (M6-M8) are
  postponed. See [ROADMAP.md](ROADMAP.md).
- Web iterations live under [iterations/](iterations/README.md).
  Each iteration has one page listing its data and doc deltas.
- Design pages describe the target. Iteration pages describe the change that moves
  `src/` toward that target. When an iteration ships, its facts graduate from
  `planned` to `live` on the design pages.
- When a top-level file (GDD, WORLDS, ENEMIES) grows a deep subtree, it stays as a
  short hub that links down rather than duplicating the detail.
