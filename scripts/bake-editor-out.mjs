import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const root = path.resolve(import.meta.dirname, "..")

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (name.endsWith(".json")) {
      out.push(full)
    }
  }
  return out
}

function chunkIndexForX(origins, widths, worldX) {
  let idx = 0
  for (let i = 0; i < origins.length; i += 1) {
    const origin = origins[i]
    const width = widths[i] ?? 960
    if (worldX < origin + width || i === origins.length - 1) {
      idx = i
      break
    }
    idx = i
  }
  return Math.max(0, Math.min(idx, origins.length - 1))
}

function redistributeDecor(bundle, levelChunks) {
  const top = Array.isArray(bundle.decor) ? bundle.decor : []
  const chunkIds = levelChunks.filter((id) => bundle.chunks?.[id])
  if (!chunkIds.length) {
    return
  }
  for (const id of chunkIds) {
    bundle.chunks[id].decor = []
  }
  if (!top.length) {
    return
  }
  const widths = chunkIds.map((id) => Number(bundle.chunks[id].width) || 960)
  const origins = []
  let x = 0
  for (const width of widths) {
    origins.push(x)
    x += width
  }
  for (const piece of top) {
    const worldX = Number(piece.x) || 0
    const idx = chunkIndexForX(origins, widths, worldX)
    const id = chunkIds[idx]
    const origin = origins[idx] ?? 0
    bundle.chunks[id].decor.push({
      ...piece,
      x: worldX - origin,
      y: piece.y,
    })
  }
}

const levelFiles = walk(path.join(root, "src/data/story"))
const byId = new Map()
for (const file of levelFiles) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"))
  if (json.id) {
    byId.set(json.id, { file, chunks: json.chunks ?? [] })
  }
}

const dumpDir = path.join(root, "src/data/editor-out")
const dumps = fs.readdirSync(dumpDir).filter((name) => name.endsWith(".editor.json"))
let chunkCount = 0
let levelCount = 0
let decorCount = 0
const hash = crypto.createHash("sha256")
for (const file of dumps.sort()) {
  const raw = fs.readFileSync(path.join(dumpDir, file), "utf8")
  hash.update(file)
  hash.update(raw)
  const bundle = JSON.parse(raw)
  const meta = byId.get(bundle.levelId)
  if (meta) {
    redistributeDecor(bundle, meta.chunks)
    decorCount += Array.isArray(bundle.decor) ? bundle.decor.length : 0
    fs.writeFileSync(path.join(dumpDir, file), `${JSON.stringify(bundle, null, 2)}\n`)
  }
  for (const chunk of Object.values(bundle.chunks || {})) {
    const dest = path.join(root, "src/data/chunks", `${chunk.id}.json`)
    fs.writeFileSync(dest, `${JSON.stringify(chunk, null, 2)}\n`)
    chunkCount += 1
  }
  if (!meta) {
    continue
  }
  const level = JSON.parse(fs.readFileSync(meta.file, "utf8"))
  const next = bundle.level || {}
  if (next.playerSpawn) {
    level.playerSpawn = next.playerSpawn
  }
  if (next.exit) {
    level.exit = next.exit
  }
  if (Array.isArray(next.moonPools) && next.moonPools.length) {
    level.moonPools = next.moonPools
    level.moonPool = next.moonPools[0]
  } else if (next.moonPool) {
    level.moonPool = next.moonPool
  }
  if (next.env) {
    level.env = next.env
  }
  if (next.sky) {
    level.sky = next.sky
  }
  fs.writeFileSync(meta.file, `${JSON.stringify(level, null, 2)}\n`)
  levelCount += 1
}

const stamp = hash.digest("hex").slice(0, 16)
fs.writeFileSync(
  path.join(root, "src/data/editor-shipped-stamp.json"),
  `${JSON.stringify({ stamp }, null, 2)}\n`,
)

console.log(`baked ${levelCount} stations, ${chunkCount} chunks, ${decorCount} decor pieces, stamp ${stamp}`)
