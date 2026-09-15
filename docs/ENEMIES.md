# Bunny Meadow — Enemies

New enemies are data plus a spritesheet. New code only when adding an archetype. Schema lives in `src/data/enemies.json`.

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
| boss | Fox Hu, Heron Fisher, Crane Envoy | Scripted phases composed from the above |

Owls use `diver` as ordinary night enemies only. They are never Moon servants. See [LORE.md](LORE.md).

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
| owl | diver | Story W3 (enemy only) |
| cat | reach | Story W3 |
| bees | swarm | Meadow optional |
| goat | blocker | Story W2 optional |
