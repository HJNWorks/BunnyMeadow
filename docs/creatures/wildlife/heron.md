# Wildlife — Heron

Status: live (Story). Class: Wildlife. Archetype: fisher. Hub: [../README.md](../README.md).
Raft Gauntlet uses two of these. They are not a hit-count boss. See
[../folk/heron-fisher.md](../folk/heron-fisher.md).

| Field | Value |
| --- | --- |
| Home biomes | riverbank |
| Active hour | dusk |
| Min tier | 3 |
| Hearts | 1 |
| Safe from above | yes |

## Behaviour

| Phase | Pose | Trigger | Motion | Hit | Escape |
| --- | --- | --- | --- | --- | --- |
| hover | slow wing flap | default | holds above the logs, a small drift | none | walk under it |
| lock | wings spread flat, red eye | Mei is under it, within about one log of its home | stops and aims at Mei | none | step out from under it before the beat ends |
| sweep | wings swept back, body along the line | lock ends | flies through Mei and past her | 2 hearts and a shove off the log | dash as the body arrives. An early dash is already over |
| climb | flap | sweep ends or it reaches the water | returns to the high hold | none | - |

Live on Floating Logs and as a pair on Raft Gauntlet. The burrow on the rafts does not require a kill.

## Telegraph and counter

The spread wings are the tell. The sweep is the hit. Time the dash for the moment the bird reaches Mei.

## Silhouette rule

Tall, thin, long legs, S-neck, and a spear beak. Not a pale blob.

## Bunny Jump

Jump role: column_swipe. Status: planned ([I5](../../iterations/i5-bunny-jump.md)).
Poke up or down the column after the same crouch telegraph. Side contact costs a
heart. Landing from above removes it. Same stamp. Design:
[../../modes/tasks/bunny-jump.md](../../modes/tasks/bunny-jump.md).
