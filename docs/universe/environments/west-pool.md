# Environment — West Pool

Status: live (Chapter 3, West of Silver). Hub: [../README.md](../README.md).
Chapter: [../../story/chapters.md](../../story/chapters.md). Court pool:
[../../LORE.md](../../LORE.md#yaochi--jade-pool-瑤池). Folk:
[../../creatures/folk/old-face.md](../../creatures/folk/old-face.md),
[../../creatures/folk/xiwangmu.md](../../creatures/folk/xiwangmu.md).

One station, live. Palette `ch3_pool`. Hops return toward
Earth weight.

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | west court |
| Hour | west dawn |
| Lore anchor | Xiwangmu at Yaochi (cards do not print those names). The pool seal is invented |
| Movement verb | court walk, then stand still |
| Hazard vocabulary | still jade pool, surface wisps, a lunge. No wildlife line |

## Feel

One still jade pool under pale west light. Map card title stays West Pool. Tagline
stays "One still pool." Do not print Yaochi, Kunlun, portal, 西王母, the seal, the
stamp, or 心魔. Art pin stays `{ x: 86, y: 16 }` on `public/Story-Background-ch3.png`.
The painting already has an empty jade terrace. No new world-map art.

Ordinary Moon Pools stay Chang'e's channel. This pool is the court, not a checkpoint
line from Chang'e. No Chang'e ticker on this station.

The pool holds an invented seal under a false stamp. Mei settles the seal's old face,
and the seal surfaces. Then she is offered a peach of immortality (the same elixir
source Chang'e drank) and refuses. The seal does not take it either. She stays a kit
who waves at the moon. Yue is already home. Rescue is closed. Not a second Han. No
kitchen. Xiwangmu is never an HP bar.

## Stations

| Station | Id | Chunks | Notes |
| --- | --- | --- | --- |
| Court | `ch3_pool_1_court` | two, 960 px | Live. Earth weight (`lowGravity` off). Near terrace and rim, pool across the join, far terrace empty until the seal surfaces |

`ch3_pool` is live on the world map. Chapter chip unlock stays One Moon Pool. West
Pool opens after the previous live Chapter 3 world is cleared (Grotto Heaven once it
ships). While it is the only live Chapter 3 world, it opens with the chapter.

## Map

Left to right:

- Chunk 0: spawn on the jade terrace, then the near rim.
- The pool sits across the chunk join. Four stone lips ring it. Mei walks the rim. She does not swim.
- Chunk 1: far terrace. Empty during the fight. The peach and the court gate appear here only after the seal surfaces.

The jade water is a hazard volume, not a Moon Pool. The clear is the court gate after
the refusal. Not a burrow hole.

## Mechanics

The verb is the reverse of Far Silver's silver skin. There, standing still for 0.8 s
breaks the floor. Here, standing still for 0.8 s on an unused rim lip lifts one
quarter of the stamp.

Not a mooncake dash. Not a touch-the-glow. Mei cannot hurt the body.

| Piece | Rule |
| --- | --- |
| Start | Enter the court AABB around the pool. Same proximity pattern as Han and Penghou |
| Goal | Four lips, one each. HUD shows four stamp marks, the way Penghou shows open cuts |
| Plant | Stand still on an unused lip for 0.8 s. The reflection is drawn onto that lip and one quarter of the stamp lifts. Leaving early cancels that plant |
| Pressure | Before two lifts, spirit wisps travel the surface. After two lifts, the mask drops and the old face lunges at a lip that is held past the crack |
| Hit | A wisp or a lunge costs one heart. The plant window itself does not |
| Escape | Dash passes through a wisp and through a lunge. A bare dash does not lift a stamp |
| Water | Falling in costs one heart and returns Mei to the rim. No swim. No drowning frame |
| Reset | Hearts gone, falling in the pool, or walking back onto the entrance terrace before it settles. A jump, including the hop across the middle, does not reform the stamp |
| After | Fourth lift settles it. Wisps stop. The seal rises out of the pool and the burrow gate stays gone. Mei lands on the seal. It speaks, then both spiral into one point and the ledger opens |

Peach beat, after the settle only. A peach rests on the far stone. It is not a pickup
and not a heal. Contact starts a ticker line, the same HUD as a Moon Pool, and does
not pause play. Confirm refuses. The seal does not move toward the peach. Contact
with the court gate then clears the chapter.

## Roster

Wildlife: none. Folk: the [old face](../../creatures/folk/old-face.md) is the settling
spirit (two poses of one body). [Xiwangmu](../../creatures/folk/xiwangmu.md) offers
after the seal surfaces, accepts the refusal, never an HP bar, never a sprite. No
steward.

## Item table

| Item | Notes |
| --- | --- |
| jade dew | idea. Brief west glow. Not immortality |
| peach | not an item. Story beat on the far terrace after the settle. Do not ship as a heal |

## Render notes

Jade terrace and a quiet court pool. Pale shape under the water while the stamp holds.
Darker same silhouette on the surface during the fight. No giant goddess portrait. No
name on the card.

## Endless status

Story Chapter 3 only.
