# Folk — Han

Status: live. Class: Folk (Moon boss). Hub: [../README.md](../README.md).
LORE: [invented](../../LORE.md) (same license as Heron Fisher). Story: [../../STORY.md](../../STORY.md).

## Role

An old ghost of Vast Cold. He is the palace's habit of keeping guests, not a named
figure from the ledger. Chang'e, Yue, Yutu, Wu Gang, and the moon toad stay off this
HP bar. After he settles, a moon grows at his last place and the existing gift beat
still plays.

## Boss encounter

Guanghan, moon finale after the Cloud Stair. Spirit hearts start at 5/5. Mei cannot attack. A consumed
mooncake starts a short warmth buff (about 3 s). Only a dash into Han while that
buff is live removes one spirit heart. A bare dash does nothing to him and still costs
Mei a heart on contact.

Projectiles stay night-themed and fire from Han toward Mei as a radial fan:

- 5 and 4 hearts: frost spears in a tight cone aimed at Mei. Roam speed 96.
- 3 and 2 hearts: star needles in a wider cone. Roam speed 168. A lunar beam can roll
  after a 10 s cooldown (2 s charge, 4 s tracking slab, 2 hearts on contact).
- 1 heart: both volleys at once. Roam speed 248. Beam charge drops to 1 s, same 4 s slab
  and 10 s cooldown.
- 0: Han is pulled into an inward spiral at his last position. An outward spiral grows a
  large moon there (visual only, not a solid). Then settled. Exit and the four epilogue
  cards are unchanged.

Spike fan timing and counts are unchanged from the first live fight. The beam is a
separate Graphics slab. It tracks Mei with a capped turn rate so a strafe can leave it.
Dash i-frames still apply. Reduced motion shortens the charge and skips spiral motes.

Han speaks four ticker lines on the same HUD as Moon Pools (no pause). Full health, 3
hearts, 1 heart, and beaten. Moon Pool lines on Guanghan stay Chang'e's. Editor Build
does not speak.

Han roams the sky rather than holding one perch. Every lost heart still enlarges and
darkens the silhouette. Low gravity stays. Cakes spawn in the open, not under roofs.
Spirit hearts sit at the top center.

## Guard

No fireballs, no water as a weapon, no stove. Hou Yi and the ten suns stay background.
Festival lanterns belong to World 3.

## Silhouette rule

Tall pale mist with a hollow chest, armor plates, a helmet, and a half-moon on the crown.
Not a palace lady. Not Chang'e or Yutu. The stamp lives in `src/render/stamps.ts` as
`story_han`. Asset Workshop Creatures can paint that key. Rage skins `story_han_0` through
`story_han_4` are copies. Han is not a map-editor wildlife token.
