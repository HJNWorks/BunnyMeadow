# Creature voices

Catalog of every creature line that appears as text to the player, so a later wav can
play in sync with that text. Data: `src/data/voices.json`. Helpers: `src/data/voices.ts`.
Hub: [README.md](README.md).

Drop files at:

`public/voices/{lang}/{speakerId}/{cueId}.wav`

Example: `public/voices/en/han/han.full.wav`

Languages: en, de, zh. If the current language file is missing, playback falls back to
en. Missing files stay silent. Playback is wired on ticker, crane bow, World 0 Chang'e
beat, and Guanghan epilogue cards.

Editor overlay Moon Pool lines are not in this catalog. Record those only after they
become shipped i18n.

No Return and Closing Gale have moon i18n keys but no pool. Do not record those until
a pool exists (`silentI18n` in the JSON).

## Who speaks today

| Speaker | Mode | Channel | Live cues |
| --- | --- | --- | --- |
| Han | Story / Guanghan | ticker | 4 |
| Chang'e | Story | beat + ticker + epilogue | 1 beat, 12 pools, 1 epilogue |
| Crane Envoy | Story | dialogue + epilogue | 2 bow, 1 epilogue |
| Mei | Story epilogue | epilogue | 1 (narrated card) |
| Yue | Story epilogue | epilogue | 1 (narrated card, she does not speak) |

Fox Hu, Heron Fisher, Tu'er Ye, Closing Gale, Wu Gang, Yutu, and the moon toad have
empty cue lists. Wildlife has none. Meadow, Moon Tasks, and Endless have no speakers
yet.

`voice: character` is first-person speech. `voice: narrated` is a third-person card
that names the creature. Record character lines first.

## Later code

TODO: stop voice when the ticker is skipped or the dialogue card closes.
TODO: measure wav length and keep the ticker up until the line ends.
TODO: reduced-motion still plays voice.
