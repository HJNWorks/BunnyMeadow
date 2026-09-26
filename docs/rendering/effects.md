# Rendering — Effects

Weather, night lighting, and the mist wall. Each is a reusable system keyed off a biome or an
hour, not a bespoke per-level effect. Hub: [README.md](README.md). Shared kit:
`src/modes/story/shared/themeKit.ts` (I3, live on Story and Endless).

## Weather presets

Weather is a named particle preset chosen per biome and gated by hour
([../universe/timeline.md](../universe/timeline.md)). One emitter, swapped by preset.

| Preset | Look | Rungs |
| --- | --- | --- |
| pollen | slow drifting motes | meadow, orchard |
| leaves | tumbling leaves | orchard, bamboo |
| drizzle | light rain streaks | riverbank |
| fireflies | rising warm points | lantern |
| lantern ash | slow falling embers | lantern |
| blossom | four-petal blossoms drifting | osmanthus |
| snow | white specks blown left | cloud-sea |
| none | no specks | cassia wound |
| star drift | slow twinkles, little vertical fall | moon, most Chapter 2 kits |
| dust motes | faint horizontal ash | Dust Sea |
| wind streaks | horizontal gust lines | osmanthus, cloud-sea |
| cloud wisps | foreground cloud drift | cloud-sea |

The moon has no atmosphere. Guanghan and Chapter 2 do not use blossom fall or snow.
`starDrift` is twinkles. Dust Sea uses `dustMotes`. Cassia uses `none`.

Reduced motion cuts particle count sharply and slows or stops drift.

## Night lighting

Night is a cheap layered effect, not a full light system (leaning cheap, see the open
questions in [README.md](README.md)):

- A multiply overlay tinted by the biome fog and hour darkens the scene. Strength ramps by
  hour: off in afternoon and golden, partial at dusk, full at night and deep night, full and
  fixed on the moon.
- Lantern light is an additive sprite with a soft radius, placed on lantern props and on the
  lantern item while held ([../items/catalog.md](../items/catalog.md)). It cuts a hole in the
  multiply overlay.
- Burrow Tunnels use the same overlay for darkness during the afternoon, with a small radius
  around the player, which is the one time lighting is on outside night.

## The mist wall

The Endless chase is the signature effect. Design target:

- Layered scrolling sprites of the biome fog colour, two or three parallax bands, so the wall
  reads as depth rather than a flat rectangle.
- A soft leading edge with drifting tendrils, faster than the bands behind it.
- Speed and distance-behind are driven by tuning, not render code
  ([../modes/endless/tuning.md](../modes/endless/tuning.md)).
- The lantern item push is a visible recede of the whole wall over a short ease, with a light
  flash, so the player reads the reward ([../items/placement.md](../items/placement.md)).
- A shader is optional and only if layered sprites underperform on a low-end Deck.

Endless draws two or three fog-coloured bands (one under reduced motion), the fox motif on
the leading edge, and embers. A lantern pickup still pushes `chaseX` and starts a ~1.6 s
additive glow on the player. Story Paper Lights uses a weaker constant glow. Meadow and Tasks
are unchanged.

## Reduced motion summary

| Effect | Reduced-motion behaviour |
| --- | --- |
| weather | fewer particles, little or no drift |
| night lighting | static overlay, no flicker on lanterns |
| mist wall | single band, no tendril animation, no shake |
| screen shake | disabled (see [animation.md](animation.md)) |

## Pestle beat

Mortar Yard only. Lives with the mover in `src/modes/story/shared/moversHazards.ts`.

| Beat part | Effect |
| --- | --- |
| hold | A shadow ellipse on the bowl darkens toward the slam |
| last 12% of the hold | The head trembles about 2 px |
| slam lands | Seven pale dust puffs (jade and bone) spread and fade |

Reduced motion keeps the shadow, drops the tremble, and throws two puffs. No
camera shake and no sound yet.

## Outer Cold

| Piece | Effect |
| --- | --- |
| guest screen | Same beat telegraph as the pestle (floor shadow, tremble before closing). Five frost puffs when it shuts |
| chime stone | A pale ring expands off the stone and the stone dips 6 px. Reduced motion keeps a small ring and no dip |

## Dust Sea

| Piece | Effect |
| --- | --- |
| dust tide | Faint band. Pale streaks drift with the current |
| vent | Column brightens while it breathes. Streaks rise fast when on and crawl when off. A four-puff warning at the mouth just before it breathes |
| sinking dust | Rippled pale crust over a body that darkens with depth. Drawn over Mei so she sinks into it |
| crater crab | Three dust puffs and a fade when it digs in or pops up |

Reduced motion keeps every tide visible with fewer, slower streaks and skips the
vent warning puffs.

## Cassia Wound

| Piece | Effect |
| --- | --- |
| bark cut | Slabs tremble before they close. Gold motes where they meet |
| healing bark | Wood crack stages, then it fades back in over 0.36 s when it regrows |
| Penghou | Gold flicker during the volley windup. Gold spark ring when a cut closes. A slow gold glow once it settles |
| gold cut | Soft pulsing glow until closed. Reduced motion keeps a steady glow |

## Quiet Wells

| Piece | Effect |
| --- | --- |
| dim lip | 5% until lit. Fades up over 0.42 s with five silver motes |
| reflection lip | Lit: fades to 30%, silver tint, a slow horizontal ripple |
| still water (all lunar stations) | Dark blue-black fill with a 3 px silver skin instead of river blue |

Reduced motion lights instantly, with no motes and no ripple.

## Far Silver

| Piece | Effect |
| --- | --- |
| silver skin | Radial lines spread while Mei stands still, then it drops away. It fades back in when it regrows |
| silver carp | Leaps high out of the dark moon water |

