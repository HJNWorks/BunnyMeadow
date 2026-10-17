# Folk — Old face

Status: live (Chapter 3 West Pool court). Class: Folk.
Hub: [../README.md](../README.md). LORE: [invented](../../LORE.md#invented-elements-ours).
Story: [../../STORY.md](../../STORY.md). Environment:
[../../universe/environments/west-pool.md](../../universe/environments/west-pool.md).

## Role

The pool seal is an invented beast in the jade water. Classical bestiaries do not
name it, and the pages do not pretend the *Shanhaijing* does. Do not call it 海狗
in player text.

A false stamp (印) holds it under the water. Daoist seals bind and command spirits.
This one is backwards: it binds a living creature. It is not the Heirloom Seal of
the Realm. Mei does not take a mandate.

The captor is the seal's 心魔, the inner demon that comes from one's own mind. In
play that captor is the old face, the same beast seen darker on the water. Evil
spirits are the mask it wears at first. When the mask drops, it is the same silhouette,
harder and older. One captor, not a swarm.

It is the habit of holding shut. Han is the habit of keeping guests. This is not a
second Han. It is not Xiwangmu, not a canon god, and not a human figure. Mei meets
it because water is already her channel. She does not kill it. She settles it. Fail
is a retry. Nothing is eaten or destroyed.

The binding mark can read as 留 ("stay / keep"). That rhymes with the guest screens
(留客屏) and does not copy that level. When it settles, the stamp lifts, the water
clears, and the living seal surfaces. It does not confess.

## Two poses

One scripted body. Not a row in `enemies.json`. Not an editor wildlife brush. No
boss module yet.

- **Pool seal.** Pale shape under the water while the stamp holds. No contact hit. After the settle it rests on the surface and stays there. It does not speak and does not take the peach.
- **Old face.** The fight pose, on the water only. Same silhouette, darker. The spirit wisps are this phase, not jade mites and not a second roster.

## Encounter

Station `ch3_pool_1_court`. Module: `src/modes/story/shared/oldFaceBoss.ts`.
Enter the pool to start. Walking back onto the entrance terrace before it settles, or falling
in the water, reforms the stamp. A jump does not.

Mei cannot hurt the body. A dash passes through a wisp and through a lunge. A bare
dash does not lift a stamp. Standing still for 0.8 s on an unused rim lip lifts one
quarter. That is the reverse of Far Silver's silver skin, where standing still breaks
the floor.

| Phase | Pose | Trigger | Motion | Hit | Escape |
| --- | --- | --- | --- | --- | --- |
| Mask | dark shape under the water, wisps on the surface | enter the court | wisps travel the surface | wisp, 1 heart | dash through |
| Plant | reflection pulled to the lip Mei holds | still 0.8 s on an unused lip | slides to that lip, one stamp quarter lifts | none | leave the lip to cancel |
| Face | darker seal on the water | two quarters lifted | one lunge from the pool toward a lip she is still holding, then it returns | lunge, 1 heart | dash through, or leave the lip |
| Settled | the seal rises out of the pool | fourth lift | stops, then rises. The gate stays gone | none | jump onto the seal |

The HUD shows four stamp marks, the way Penghou shows open cuts. Falling in the pool
costs one heart and returns Mei to the rim. No swim. No drowning frame.

After the fourth lift the far terrace opens. The peach offer is a ticker, not this
spirit. See [xiwangmu.md](xiwangmu.md).

## Voice

Four ticker lines, the same HUD as Moon Pools: wake, the mask drops, settled, the
peach refused. No confession. Wav files wait until the station exists
([voices.md](../voices.md)).

## Guard

Never killed. Not the Heirloom Seal. Not a *Shanhaijing* beast. Not Xiwangmu, and
not her steward. Xiwangmu stays off the HP bar and has no portrait. The old face
does not follow Mei off the pool.
