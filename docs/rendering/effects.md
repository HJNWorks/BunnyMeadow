# Rendering — Effects

Weather, night lighting, and the mist wall. Each is a reusable system keyed off a biome or an
hour, not a bespoke per-level effect. Hub: [README.md](README.md).

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
| blossom | four-petal blossoms drifting | osmanthus, moon |
| wind streaks | horizontal gust lines | osmanthus, cloud-sea |
| cloud wisps | foreground cloud drift | cloud-sea |
| star drift | slow star parallax | moon, cloud-sea |
| dust motes | faint underground motes | burrow-tunnels |

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

The current build draws the fox chase marker in front of the mist with a fire trail (recent
project history). The wall design above keeps that fox as the leading motif on the wall's edge.

## Reduced motion summary

| Effect | Reduced-motion behaviour |
| --- | --- |
| weather | fewer particles, little or no drift |
| night lighting | static overlay, no flicker on lanterns |
| mist wall | single band, no tendril animation, no shake |
| screen shake | disabled (see [animation.md](animation.md)) |
