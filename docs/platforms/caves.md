# Caves

Quiet Wells and other lunar interiors. Hub: [README.md](README.md). Quiet Wells:
[../universe/environments/quiet-wells.md](../universe/environments/quiet-wells.md).
Collision stays solid both ways. One-way pads stay with Bunny Jump.

## Mass above

The sky is a roof, not open meadow. Place a `ceiling` slab above the hop band so hops
meet rock. Same Arcade solid as a wall. Stamp is lunar cave rock, not meadow hedge.

Editor token: Ceiling. JSON: chunk `ceilings[]`, or a platform with `kind: "ceiling"`.

## False mouths

A cave lip that is not an exit. Unreachable mouths and dead tunnels sit off the hop
line. Decor `falseMouth` uses the cave stamp. Contact does not open a station. The
real burrow / station exit stays the only contact hole.

## Water below

Quiet Wells keep still water under the pads. One true exit. Mass above. False mouths
off the hop line. Water in the basin. You place the geometry. These types only name
the pieces.

## Do not

Do not treat a false mouth as an exit overlap. Do not ship one-way pads here.
