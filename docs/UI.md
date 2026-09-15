# Bunny Meadow — UI and Save

## Screen flow

```
Boot -> Preload -> Title
  Title -> Mode Select
  Title -> Settings
  Title -> Customize
  Title -> Credits
Mode Select -> Meadow | Story World Map | Moon Tasks | Endless
Story World Map -> Story level -> Result -> World Map
Any play -> Pause -> Resume | Settings | Quit to Mode Select
DialogueOverlay can sit above Story or Meadow
```

Screens: Boot, Preload, Title, Mode Select, World Map, Settings, Customize, Pause, Result, DialogueOverlay, Credits.

## HUD components (shared)

| Component | Shows |
| --- | --- |
| Hearts | Current hearts |
| Carrots | Count / goal |
| Dash | Ready or cooldown |
| Objective | One short line |
| Timer | Tasks and speedruns |

Modes compose the same components. Meadow keeps the existing bar layout ported into Phaser UI.

## Settings

- Audio: master, music, sfx
- Key remap
- Gamepad remap (first-class from M1)
- Touch layout
- Difficulty preset + per-parameter overrides
- Accessibility toggles (see [GDD.md](GDD.md))
- Language: EN, DE, ZH-Hans
- Fullscreen and resolution (desktop only)

## Customize

Unlocked by pantry level. Cosmetics only.

| Slot | Options (seed) | Unlock |
| --- | --- | --- |
| Name | free text, default Mei | always |
| Fur | cream, brown, gray, moon-white | pantry 1+ |
| Ears | upright, lop, tufted | pantry 2+ |
| Accessory | none, scarf, lantern, blossom | pantry 3+ |

## Save schema v1

Three slots behind `SaveStore` (`core/platform`). Web: `localStorage`. Desktop: JSON files under Electron `userData` for Steam Auto-Cloud.

```json
{
  "version": 1,
  "slot": 0,
  "updatedAt": "2026-09-15T00:00:00.000Z",
  "player": {
    "name": "Mei",
    "fur": "cream",
    "ears": "upright",
    "accessory": "none"
  },
  "settings": {
    "difficulty": "hopper",
    "difficultyOverrides": {},
    "accessibility": {
      "invincible": false,
      "slowTime": false,
      "autoDash": false,
      "highContrast": false,
      "reducedMotion": false,
      "largerText": false,
      "oneButtonTouch": false
    },
    "audio": { "master": 1, "music": 0.8, "sfx": 1 },
    "language": "en",
    "bindings": {}
  },
  "progress": {
    "pantryLevel": 1,
    "pantryCarrots": 0,
    "meadowMapsUnlocked": ["meadow_home"],
    "story": {
      "world": 1,
      "level": 1,
      "cleared": [],
      "checkpoints": {}
    },
    "tasksCompleted": [],
    "endlessBest": 0,
    "achievements": []
  }
}
```

Migration: `migrateSave(raw) -> SaveV1`. Bump `version` and add a branch per old version. Never write without migrating first.

## Storage keys (web)

- `bunnymeadow.save.0` … `bunnymeadow.save.2`
- `bunnymeadow.settings` (last used slot index and global prefs mirror)
