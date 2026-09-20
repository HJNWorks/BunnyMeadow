# Iteration I5 — Bunny Jump

Status: live. Hub: [README.md](README.md). Design:
[../modes/tasks/bunny-jump.md](../modes/tasks/bunny-jump.md).

Playable scene `BunnyJump` under Moon Tasks. One-way auto-bounce, X wrap, upward
camera, height bands, moon disc win, local best `progress.bunnyJumpBest`. No
`package.json` bump. No new Steam achievement ids.

## Deltas

- Task Select card `bunny_jump` launches `BunnyJump` (not TaskRuntime)
- One-way bounce pads, crumble `land`, lantern boost, slide, ice slick
- Meadow/orchard perch wildlife (fox, hedgehog)
- `migrateSave` for `progress.bunnyJumpBest`

## Still later

hop_ledge, drop_shot, stoop, column_swipe, ledge_charge, drift in `jumpKit`.
Vanish pads. Bees / tortoise / boar jump debuts after Story I8. Lantern Run stays deferred.

## Ship

Pages updates when the files land on `main`.
