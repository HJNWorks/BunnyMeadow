import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outDir = path.join(root, "src/data/chunks/endless")
fs.mkdirSync(outDir, { recursive: true })

const W = 960
const GROUND = 980
const ENTRY = { x: 0, y: GROUND, w: 240, h: 100 }
const EXIT = { x: 720, y: GROUND, w: 240, h: 100 }

const COLOR = {
  meadow: "#c5d48a",
  orchard: "#b8c47a",
  bamboo: "#5f7a52",
  riverbank: "#6b94a0",
  lantern: "#3d4560",
  osmanthus: "#40364a",
}

const LOG_TINT = 10066176

function pad(extra = {}) {
  return { x: ENTRY.x, y: ENTRY.y, w: ENTRY.w, h: ENTRY.h, ...extra }
}

function frame(env, tier, variant, body) {
  return {
    id: `endless_${env}_t${tier}_${variant}`,
    width: W,
    height: 1080,
    groundY: GROUND,
    platforms: [pad(), ...body.platforms, { ...EXIT }],
    walls: body.walls ?? [],
    enemies: body.enemies ?? [],
    ...(body.movers ? { movers: body.movers } : {}),
    ...(body.hazards ? { hazards: body.hazards } : {}),
    ...(body.carrots ? { carrots: body.carrots } : {}),
    endless: { env, tier, entryY: GROUND, exitY: GROUND },
    color: COLOR[env],
  }
}

function stepBody(tier, variant) {
  const a = tier <= 1 ? 900 : tier === 2 ? 860 : 820
  const b = tier <= 1 ? 900 : tier === 2 ? 840 : 800
  const shift = variant === "b" ? 20 : 0
  return {
    platforms: [
      { x: 340 + shift, y: a, w: 120, h: 24 },
      { x: 560 + shift, y: b, w: 120, h: 24 },
    ],
    enemies: tier >= 2 ? [{ id: "hedgehog", x: 400 + shift, y: a - 40 }] : [],
    carrots: [{ x: 400 + shift, y: a - 60 }],
  }
}

function gapBody(tier, variant) {
  const top = tier === 3 ? 820 : 900
  const g = tier === 3 ? 300 : tier === 2 ? 250 : 190
  const p1x = 200 + (variant === "b" ? 20 : 0)
  const p1 = { x: p1x, y: top, w: 120, h: 24 }
  const p2 = { x: p1x + 120 + g, y: top, w: 120, h: 24 }
  const enemies = tier >= 3 ? [{ id: "crow", x: 480, y: 560 }] : []
  return { platforms: [p1, p2], enemies, carrots: [{ x: p1.x + 40, y: top - 60 }] }
}

function pillarBody(tier, variant) {
  const gap = tier === 5 ? 430 : tier === 4 ? 360 : 300
  const base = variant === "b" ? 180 : 200
  const p1 = { x: base, y: 900, w: 110, h: 24 }
  const p2 = { x: base + 110 + Math.min(gap, 300), y: 840, w: 110, h: 24 }
  const p3 = { x: p2.x + 110 + Math.min(gap, tier >= 4 ? 380 : 300), y: 900, w: 110, h: 24 }
  const enemies = [{ id: "crow", x: 500, y: 520 }]
  if (tier >= 5) {
    enemies.push({ id: "hedgehog", x: p1.x + 40, y: 860 })
  }
  return { platforms: [p1, p2, p3], enemies, carrots: [{ x: p2.x + 40, y: 800 }] }
}

function logBody(tier, variant) {
  const amp = tier >= 4 ? 70 : tier === 3 ? 55 : 40
  const l1 = { x: 300, y: 900, w: 130, h: 28, axis: variant === "b" ? "y" : "x", amplitude: amp, speed: 1.2, tint: LOG_TINT }
  const l2 = { x: 520, y: 900, w: 130, h: 28, axis: "y", amplitude: amp, speed: 1.35, tint: LOG_TINT }
  return {
    platforms: [],
    movers: [l1, l2],
    hazards: [{ x: 240, y: 1000, w: 480, h: 80, kind: "water", current: tier >= 4 ? 50 : 30 }],
    enemies: tier >= 3 ? [{ id: "crow", x: 480, y: 560 }] : [],
    carrots: [{ x: 380, y: 840 }],
  }
}

function bounceBody(tier, variant) {
  const midGap = tier === 5 ? 420 : 360
  const base = variant === "b" ? 190 : 200
  const p1 = { x: base, y: 900, w: 120, h: 24 }
  const p2 = { x: base + 120 + midGap, y: 940, w: 130, h: 24 }
  const walls = [
    { x: 430, y: 640, w: 26, h: 240 },
    { x: 560, y: 700, w: 26, h: 200 },
  ]
  const enemies = [{ id: "crow", x: 500, y: 520 }]
  if (tier >= 5) {
    enemies.push({ id: "hedgehog", x: p2.x + 40, y: 900 })
  }
  return { platforms: [p1, p2], walls, enemies, carrots: [{ x: p1.x + 40, y: 860 }] }
}

const chunks = []

chunks.push(
  frame("meadow", 1, "start", {
    platforms: [
      { x: 340, y: 900, w: 120, h: 24 },
      { x: 560, y: 900, w: 120, h: 24 },
    ],
    carrots: [{ x: 400, y: 840 }],
  }),
)
// rename start id
chunks[0].id = "endless_start"

const plan = [
  ["meadow", 1, stepBody],
  ["meadow", 2, stepBody],
  ["orchard", 1, stepBody],
  ["orchard", 2, gapBody],
  ["orchard", 3, gapBody],
  ["bamboo", 2, gapBody],
  ["bamboo", 3, pillarBody],
  ["bamboo", 4, bounceBody],
  ["riverbank", 2, logBody],
  ["riverbank", 3, logBody],
  ["riverbank", 4, logBody],
  ["lantern", 3, pillarBody],
  ["lantern", 4, pillarBody],
  ["lantern", 5, pillarBody],
  ["osmanthus", 3, gapBody],
  ["osmanthus", 4, bounceBody],
  ["osmanthus", 5, pillarBody],
]

for (const [env, tier, builder] of plan) {
  chunks.push(frame(env, tier, "a", builder(tier, "a")))
  chunks.push(frame(env, tier, "b", builder(tier, "b")))
}

for (const chunk of chunks) {
  const file = path.join(outDir, `${chunk.id}.json`)
  fs.writeFileSync(file, `${JSON.stringify(chunk, null, 2)}\n`)
}

console.log(`Wrote ${chunks.length} endless chunks to ${outDir}`)
