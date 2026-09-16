import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dir = path.join(root, "src/data/chunks/endless")

const GAP_LIMIT = { 1: 200, 2: 270, 3: 330, 4: 400, 5: 460 }
const RISE_LIMIT = { 1: 100, 2: 140, 3: 160, 4: 190, 5: 210 }
const ENVS = new Set(["meadow", "orchard", "bamboo", "riverbank", "lantern", "osmanthus"])
const ENTRY_PAD_MIN = 180

if (!fs.existsSync(dir)) {
  console.error("Missing endless chunk dir:", dir)
  process.exit(1)
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
if (files.length === 0) {
  console.error("No endless chunks found in", dir)
  process.exit(1)
}

const errors = []
const seenIds = new Set()

function standableNodes(chunk) {
  const nodes = []
  for (const p of chunk.platforms) {
    nodes.push({ left: p.x, right: p.x + p.w, top: p.y })
  }
  for (const m of chunk.movers ?? []) {
    nodes.push({ left: m.x, right: m.x + m.w, top: m.y })
  }
  return nodes
}

function reaches(from, to, tier) {
  if (to.left < from.left - 1) {
    return false
  }
  const gap = to.left - from.right
  if (gap > GAP_LIMIT[tier]) {
    return false
  }
  const rise = from.top - to.top
  if (rise > RISE_LIMIT[tier]) {
    return false
  }
  return true
}

for (const file of files) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8")
  let chunk
  try {
    chunk = JSON.parse(raw)
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`)
    continue
  }
  const id = chunk.id
  const label = `${file} (${id})`
  if (!id) {
    errors.push(`${file}: missing id`)
    continue
  }
  if (seenIds.has(id)) {
    errors.push(`${label}: duplicate id`)
  }
  seenIds.add(id)
  if (path.basename(file, ".json") !== id) {
    errors.push(`${label}: filename must equal id`)
  }

  const meta = chunk.endless
  if (!meta) {
    errors.push(`${label}: missing endless metadata`)
    continue
  }
  if (!ENVS.has(meta.env)) {
    errors.push(`${label}: bad env "${meta.env}"`)
  }
  const tier = meta.tier
  if (!GAP_LIMIT[tier]) {
    errors.push(`${label}: tier must be 1..5 (got ${tier})`)
    continue
  }
  if (typeof meta.entryY !== "number" || typeof meta.exitY !== "number") {
    errors.push(`${label}: entryY/exitY must be numbers`)
    continue
  }

  const width = chunk.width
  const nodes = standableNodes(chunk)

  const entry = chunk.platforms.find(
    (p) => p.x <= 0 && p.x + p.w >= ENTRY_PAD_MIN && p.y === meta.entryY,
  )
  if (!entry) {
    errors.push(`${label}: no entry pad (x<=0, w>=${ENTRY_PAD_MIN}, top=${meta.entryY})`)
  }
  const exit = chunk.platforms.find(
    (p) => p.x + p.w >= width && p.x <= width - ENTRY_PAD_MIN && p.y === meta.exitY,
  )
  if (!exit) {
    errors.push(`${label}: no exit pad (reaches x=${width}, w>=${ENTRY_PAD_MIN}, top=${meta.exitY})`)
  }

  const isBridge = String(id).startsWith("bridge_")
  if (isBridge && meta.bridgeTo && !ENVS.has(meta.bridgeTo)) {
    errors.push(`${label}: bad bridgeTo "${meta.bridgeTo}"`)
  }

  if (entry && exit && !isBridge) {
    const entryNode = { left: entry.x, right: entry.x + entry.w, top: entry.y }
    const exitNode = { left: exit.x, right: exit.x + exit.w, top: exit.y }
    const targets = nodes.filter((n) => n !== undefined)
    const visited = new Set()
    const queue = [entryNode]
    let solved = false
    let guard = 0
    while (queue.length && guard < 5000) {
      guard += 1
      const cur = queue.shift()
      if (cur.left === exitNode.left && cur.right === exitNode.right && cur.top === exitNode.top) {
        solved = true
        break
      }
      for (const n of targets) {
        const key = `${n.left}:${n.right}:${n.top}`
        if (visited.has(key)) {
          continue
        }
        if (reaches(cur, n, tier)) {
          visited.add(key)
          queue.push(n)
        }
      }
    }
    if (!solved) {
      errors.push(`${label}: no reachable path entry->exit within tier ${tier} limits`)
    }
  }

  if (isBridge) {
    continue
  }

  for (const water of chunk.hazards ?? []) {
    if (water.kind !== "water") {
      continue
    }
    const spanL = water.x
    const spanR = water.x + water.w
    const bridges = nodes
      .filter((n) => n.right > spanL && n.left < spanR)
      .sort((a, b) => a.left - b.left)
    let cursor = spanL
    let bridged = true
    for (const b of bridges) {
      if (b.left - cursor > GAP_LIMIT[tier]) {
        bridged = false
        break
      }
      cursor = Math.max(cursor, b.right)
    }
    if (spanR - cursor > GAP_LIMIT[tier]) {
      bridged = false
    }
    if (!bridged) {
      errors.push(`${label}: water span ${spanL}-${spanR} not bridged within tier ${tier} gap`)
    }
  }

  for (const enemy of chunk.enemies ?? []) {
    if (enemy.id === "crow") {
      continue
    }
    const onFloor = chunk.platforms.some(
      (p) => enemy.x >= p.x && enemy.x <= p.x + p.w && p.y >= enemy.y && p.y - enemy.y <= 90,
    )
    if (!onFloor) {
      errors.push(`${label}: enemy ${enemy.id} at ${enemy.x},${enemy.y} not on a platform`)
    }
  }

  const ARCHETYPES = new Set(["patrol", "chaser", "ranged_lob", "reach", "diver", "swarm", "blocker", "boss"])
  const ITEM_CATS = new Set(["currency", "restore", "run-buff", "key", "cosmetic"])
  for (const slot of chunk.enemySlots ?? []) {
    if (slot.x < 0 || slot.x > width) {
      errors.push(`${label}: enemySlot x ${slot.x} out of bounds`)
    }
    if (!Number.isInteger(slot.minTier) || slot.minTier < 1 || slot.minTier > 5) {
      errors.push(`${label}: enemySlot minTier ${slot.minTier} not in 1-5`)
    }
    for (const a of slot.allow ?? []) {
      if (!ARCHETYPES.has(a)) {
        errors.push(`${label}: enemySlot allow unknown archetype "${a}"`)
      }
    }
  }
  for (const slot of chunk.itemSlots ?? []) {
    if (slot.x < 0 || slot.x > width) {
      errors.push(`${label}: itemSlot x ${slot.x} out of bounds`)
    }
    if (!Number.isInteger(slot.minTier) || slot.minTier < 1 || slot.minTier > 5) {
      errors.push(`${label}: itemSlot minTier ${slot.minTier} not in 1-5`)
    }
    for (const a of slot.allow ?? []) {
      if (!ITEM_CATS.has(a)) {
        errors.push(`${label}: itemSlot allow unknown category "${a}"`)
      }
    }
  }
}

console.log(`Endless chunks: ${files.length} files, ${seenIds.size} ids.`)
if (errors.length) {
  console.error("Endless chunk validation failed:")
  for (const e of errors) {
    console.error(" -", e)
  }
  process.exit(1)
}
console.log("Endless chunk layout ok.")
