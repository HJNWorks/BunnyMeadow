# Bunny Meadow — UI and Save

Screen list and save schema must match [ROADMAP.md](ROADMAP.md) frozen contracts. Menus are HTML. Playfields are Phaser.

## Screen flow

```
Boot -> Preload -> Title
  Title -> Mode Select
  Title -> Settings
  Title -> Customize
  Title -> Credits
Mode Select -> Meadow | World Map | Task Select | Endless
World Map -> Story -> Result -> World Map
Task Select -> Task Run -> Result -> Task Select
Endless -> Result -> Mode Select
Any play -> Pause -> Resume | Settings | Quit to Mode Select
DialogueOverlay can sit above Story or Meadow
```

### Scene registry (all real routes)

| Key | Role | Notes |
| --- | --- | --- |
| Boot | system | |
| Preload | system | loads active save |
| Title | menu | splash |
| ModeSelect | menu | hub; reads contentFlags |
| Settings | menu | |
| Customize | menu | |
| Credits | menu | includes achievements list |
| Meadow | play | live from M0/M1 |
| WorldMap | menu | stub until M3 |
| Story | play | stub until M3 |
| TaskSelect | menu | stub until M2 |
| TaskRun | play | runner shell M1; bodies M2+ |
| Endless | play | stub until M5 |
| Pause | overlay | shared |
| DialogueOverlay | overlay | stub until M3 |
| Result | menu | stub shell until modes need it |

Missing scenes are forbidden. Unfinished modes open their stub screen.

## HUD components (shared)

| Component | Shows |
| --- | --- |
| Hearts | Current hearts |
| Carrots | Count / goal |
| Dash | Ready or cooldown |
| Objective | One short line |
| Timer | Tasks and speedruns |

Modes compose the same components. Meadow keeps its bar layout as one consumer. Story and others reuse the contract.

## Settings

- Audio: master, music, sfx (bus from M1; assets from M5)
- Key remap for actions below
- Gamepad remap (first-class from M1)
- Touch layout
- Difficulty preset + per-parameter overrides
- Accessibility toggles (see [GDD.md](GDD.md))
- Language: EN, DE, ZH-Hans (`t(key)` from M1)
- Fullscreen and resolution (desktop)

## Input actions (bindings)

All modes share these action names. Stored under `settings.bindings`.

| Action | Default keyboard (seed) | Notes |
| --- | --- | --- |
| `move` | WASD + arrows | vector |
| `dash` | Space | |
| `jump` | KeyK or KeyZ | no-op in Meadow; required from M1 for Story |
| `pause` | KeyP | |
| `confirm` | Enter / South face | menus |
| `cancel` | Escape / East face | menus |

Gamepad: left stick / d-pad for move; South dash or confirm by context; West or LB jump; Start pause. Exact indices live in the bindings object and Settings remap UI.

## Customize

Unlocked by pantry level. Cosmetics only. Unlock helper exists in M1; gates enforced from M2.

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
    "bindings": {
      "moveUp": ["KeyW", "ArrowUp"],
      "moveDown": ["KeyS", "ArrowDown"],
      "moveLeft": ["KeyA", "ArrowLeft"],
      "moveRight": ["KeyD", "ArrowRight"],
      "dash": ["Space"],
      "jump": ["KeyK"],
      "pause": ["KeyP"],
      "confirm": ["Enter"],
      "cancel": ["Escape"]
    }
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

Migration: `migrateSave(raw) -> SaveV1`. Bump `version` and add a branch per old version. Never write without migrating first. Never add a parallel store for story/tasks/endless.

Fields reserved for later milestones (must exist from M1): `progress.story.*`, `tasksCompleted`, `endlessBest`.

## Storage keys (web)

- `bunnymeadow.save.0` … `bunnymeadow.save.2`
- `bunnymeadow.settings` (last used slot index and global prefs mirror)
