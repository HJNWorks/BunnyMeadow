# Folk — Han

Status: live. Class: Folk (Moon boss). Hub: [../README.md](../README.md).
LORE: [invented](../../LORE.md) (same license as Heron Fisher). Story: [../../STORY.md](../../STORY.md).

## Role

An old ghost of Vast Cold. He is the palace's habit of keeping guests, not a named
figure from the ledger. Chang'e, Yue, Yutu, Wu Gang, and the moon toad stay off this
HP bar. After he settles, a moon grows at his last place. That moon is the inner
gate into Chapter 2. Yue and the kits go home. Mei jumps on it. The gift beat
still plays first.

## Boss encounter

Guanghan, moon finale after the Cloud Stair. Spirit hearts start at 5/5. Mei cannot attack. A consumed
mooncake starts a short warmth buff (about 3 s). Only a dash into Han while that
buff is live removes one spirit heart. A bare dash does nothing to him and still costs
Mei a heart on contact.

Projectiles stay night-themed and fire from Han toward Mei as a radial fan.
Shards spawn off the body along each ray so a ledge does not eat them:

- 5 and 4 hearts: frost spears in a tight cone aimed at Mei. Roam speed 96.
- 3 and 2 hearts: star needles in a wider cone. Roam speed 168. A lunar beam starts shortly
  after this stage (2 s charge, 4 s tracking slab, 2 hearts on contact), then a 10 s cooldown
  before later rolls.
- 1 heart: both volleys at once. Roam speed 248. Fan gaps are longer than the opening
  cadence (about 1.3x) so the dual streams still leave a window. Beam charge drops to 1 s,
  same tracking slab for 5.5 s and 10 s cooldown. Green ledges in the path of the hot slab
  crack and fall after 5 s of contact (thin ledges are stone even if an overlay omitted
  `break`). A beam is queued again when this stage begins.
- 0: Han is pulled into an inward spiral at his last position. An outward spiral grows a
  large moon there (visual only, not a solid). Then settled. Exit and the four epilogue
  cards are unchanged. Later: the moon is a contact pad. Jumping it unlocks Chapter 2
  ([../../story/chapters.md](../../story/chapters.md)). It is not an Earth-to-moon portal.

Frost and star fans fire in short bursts, then rest about three times as long as
the old volley cadence so Mei has a gap to eat and dash. Counts per fan are
unchanged. The beam is a long tracking rectangle, not a projectile. It leaves from the half-moon on Han's helmet. Platforms and walls clip it, so Mei can hide. The impact leaves a spark, rising embers, and a fading scorch trail. On the last heart the hot slab lasts 5.5 s and damages every registered ledge it crosses (three crack stages and a darken, then the collider drops). Reduced motion keeps one mark. Dash i-frames still apply. Reduced motion shortens the charge and skips spiral motes.

Han speaks four ticker lines on the same HUD as Moon Pools (no pause). Full health, 3
hearts, 1 heart, and beaten. Cue ids and later wav names:
[voices.md](../voices.md) (`han.full`, `han.mid`, `han.last`, `han.beaten`).
Moon Pool lines on Guanghan stay Chang'e's. Editor Build does not speak.

Han roams the sky rather than holding one perch. Every lost heart still enlarges and
darkens the silhouette. Low gravity stays. Cakes spawn in the open, not under roofs.
Each mooncake sits on the top-center of a live green pad (collider on, not broken, not a
wall or ceiling). If that ledge is deleted, resized, or dropped by the last-heart beam,
the cake despawns and the next one sits on a remaining pad. The wide floor is skipped
while any ledge remains. No cake hangs in empty sky.
If Mei's hearts empty, Guanghan restarts (Han included). Spirit hearts sit at the top
center of the playfield. Mei hearts sit at the top left.

## Guard

No fireballs, no water as a weapon, no stove. Hou Yi and the ten suns stay background.
Festival lanterns belong to World 3.

## Silhouette rule

Tall pale mist with a hollow chest, armor plates, a helmet, and a half-moon on the crown.
Not a palace lady. Not Chang'e or Yutu. The stamp lives in `src/render/stamps.ts` as
`story_han`. Asset Workshop Creatures can paint that key. Rage skins `story_han_0` through
`story_han_4` are copies. Han is not a map-editor wildlife token.
