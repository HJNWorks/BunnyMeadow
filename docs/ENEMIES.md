# Bunny Meadow — Enemies

New enemies are data plus a spritesheet. New code only when adding an archetype. Schema lives in `src/data/enemies.json`.

This page is the data-schema hub. The bestiary with one page per creature, per-biome rosters,
folk (bosses and NPCs) and the kits lives in [creatures/README.md](creatures/README.md).
Player verbs and how items change them are in [creatures/abilities.md](creatures/abilities.md).

## Archetypes

| Archetype | Examples | Behavior |
| --- | --- | --- |
| patrol | hedgehog, tortoise | Walks a path. Contact damage. Safe from above in Story |
| chaser | fox, Fox Hu (scripted) | Seeks player inside sense radius. Leaves safe zones alone |
| ranged_lob | squirrel, crow | Throws projectile on a parabola. Visible wind-up |
| reach | heron, cat | Slow or stationary. Long poke in one direction. Crouch telegraph |
| diver | owl, magpie, Crane Envoy (boss) | Circles, then dives along a shown line |
| swarm | bees | Slow cloud. Area denial. Dash passes through |
| blocker | goat, boar | Charges when the player crosses its line. Stunned on wall hit |
| water_patrol | carp | Hovers in a water band. Periodic breach |
| boss | Fox Hu, Heron Fisher, Crane Envoy, Closing Gale, Han | Scripted phases composed from the above |

Owls use `diver` as ordinary night enemies only. They are never Moon servants. See [LORE.md](LORE.md).

## Jump roles (Bunny Jump, mode-only)

These are not Story archetypes. They live in `jumpKit` and must not leak into
Story `enemyKit`. Stamps stay the workshop / story silhouettes. Design:
[modes/tasks/bunny-jump.md](modes/tasks/bunny-jump.md). Perch (fox, hedgehog) is
live ([I5](iterations/i5-bunny-jump.md)). Other roles wait.

| Id | Jump role | What it does |
| --- | --- | --- |
| hedgehog, fox | perch | sit or pace a pad. Side contact |
| frog | hop_ledge | jumps to a nearby pad |
| crow, squirrel, ice_spit | drop_shot | wind-up, then a shot down the column |
| owl, gale_magpie | stoop | shown dive line down the column |
| heron, cat | column_swipe | poke up or down the column |
| goat, boar | ledge_charge | charge across a wide pad |
| frost_wisp, bees | drift | slow cloud. Dash still passes through |
| tortoise | perch | slow pad sitter |

Fox Hu's cart, Crane Envoy, Han, Chang'e, and Yue stay off this HP bar. Skip dew
as a jump role. Bees, tortoise, boar, and carp are live on Chapter 1 Path. Jump
debuts wait.

## JSON schema

```json
{
  "id": "fox",
  "archetype": "chaser",
  "displayName": "Fox",
  "senseRange": 240,
  "attackRange": 30,
  "telegraphTime": 0,
  "cooldown": 0,
  "speed": 78,
  "hearts": 1,
  "contactDamage": 1,
  "safeFromAbove": false,
  "animations": {
    "idle": "fox_idle",
    "move": "fox_run",
    "attack": "fox_snap",
    "hurt": "fox_hurt"
  },
  "notes": "Leaves burrow safe zone alone"
}
```

Required fields: `id`, `archetype`, `senseRange`, `attackRange`, `telegraphTime`, `cooldown`, `speed`, `hearts`, `animations`.

Optional: `contactDamage` (default 1), `safeFromAbove`, `projectile`, `phases` (boss only), `notes`.

## Boss composition

Bosses are arrays of phases. Each phase names an archetype behavior and parameters.

Example sketch for Crane Envoy:

```json
{
  "id": "crane_envoy",
  "archetype": "boss",
  "phases": [
    { "behavior": "diver", "dives": 3, "speed": 120 },
    { "behavior": "reach", "pokes": 2 },
    { "behavior": "script", "event": "bow_and_carry" }
  ]
}
```

## Shipped roster (Meadow + Tasks)

Used on web today via Spawner. `reach` and later archetypes remain M3+.

| Id | Archetype | Mode |
| --- | --- | --- |
| fox | chaser | Meadow, Moon Tasks, Story W1 |
| hedgehog | patrol | Meadow, Moon Tasks, Story W1 |
| crow | ranged_lob | Meadow, Moon Tasks, Story W1 |
| squirrel | ranged_lob | Story W1 |
| heron | reach | Story W2 |
| frog | patrol | Story W2 |
| owl | diver | Story Paper Lights |
| cat | reach | Story Paper Lights |
| bees | swarm | Meadow optional. Story Soft Paws |
| tortoise | patrol | Story Soft Paths |
| boar | blocker | Story Green Corridor |
| goat | blocker | Endless (bamboo, osmanthus). Story Green Corridor |
| carp | water_patrol | Story Floating Logs |
| frost_wisp | swarm | Story W4. Palace corridors I10 |
| ice_spit | ranged_lob | Story W4 |
| gale_magpie | diver | Story W4 |
| frost_hare | patrol | Story First Steps, No Return |
| lantern_moth | diver | Story Paper Lights. Palace halls I10 |
| dust_mite | swarm | Story Chapter 2. Not Earth |
| star_wisp | swarm | Story Chapter 2. Optional Guanghan palace leak |
| pestle_sentry | ranged_lob | Story Chapter 2. Not Earth |
