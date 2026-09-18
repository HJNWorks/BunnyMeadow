# Bunny Meadow — Moon Tasks

Short objectives, about one to three minutes. Hub: [../../GDD.md](../../GDD.md).
Select screen: Task Select. Play: Task Run for Meadow-canvas tasks. Bunny Jump uses
its own Phaser scene when code lands ([bunny-jump.md](bunny-jump.md)).

Fail is retry. No gore. Off-limits as HP bars: Chang'e, Yue, Yutu, Wu Gang, moon
toad, Crane Envoy, Fox Hu.

## Roster

| Task | Goal | Playfield | Status |
| --- | --- | --- | --- |
| Night Watch | Survive waves near the burrow until dawn | Meadow canvas (`TaskRuntime`) | live |
| Hide and Seek | Find hidden kits on a Meadow map | Meadow canvas (`TaskRuntime`) | live |
| Bunny Jump | Climb one-way pads to a moon disc. Keep going for a local best height | Phaser FIT 1920x1080 (`BunnyJump`, later) | planned ([I5](../../iterations/i5-bunny-jump.md)) |
| Lantern Run | Reach the peak before lanterns go out | - | deferred |
| Daily Moon | Seeded task of the day | - | deferred |

Carrot Rush is retired (same loop as Meadow collect). Its id may remain typed for
save compat. `TASK_DAILY` stays Daily Moon. Bunny Jump does not add a Steam
achievement in I5.

Night Watch and Hide and Seek stay on the Meadow canvas and share maps, Spawner,
and `drawBunny`. Bunny Jump cannot share that stack: it is a vertical hop with
upward-only camera. Code later launches `BunnyJump` from Task Select when `kind` is
`bunny_jump`. `contentFlags.tasks` still gates the whole mode.

Wins write `tasksCompleted` and a pantry reward. Bunny Jump also intends
`progress.bunnyJumpBest` (meters) at code time, same idea as `endlessBest`.

## Pages

- [bunny-jump.md](bunny-jump.md) - climb loop, height bands, pads, jump-only mob roles
