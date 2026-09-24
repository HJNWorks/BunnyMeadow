import fs from "node:fs"
import path from "node:path"

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

const levelFiles = walk(path.join(root, "src/data/story"))
const byId = new Map()
for (const file of levelFiles) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"))
  if (json.id) {
    byId.set(json.id, file)
  }
}

const dumpDir = path.join(root, "src/data/editor-out")
const dumps = fs.readdirSync(dumpDir).filter((name) => name.endsWith(".editor.json"))
let chunkCount = 0
let levelCount = 0
for (const file of dumps) {
  const bundle = JSON.parse(fs.readFileSync(path.join(dumpDir, file), "utf8"))
  for (const chunk of Object.values(bundle.chunks || {})) {
    const dest = path.join(root, "src/data/chunks", `${chunk.id}.json`)
    fs.writeFileSync(dest, `${JSON.stringify(chunk, null, 2)}\n`)
    chunkCount += 1
  }
  const levelPath = byId.get(bundle.levelId)
  if (!levelPath) {
    continue
  }
  const level = JSON.parse(fs.readFileSync(levelPath, "utf8"))
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
  fs.writeFileSync(levelPath, `${JSON.stringify(level, null, 2)}\n`)
  levelCount += 1
}

console.log(`baked ${levelCount} stations, ${chunkCount} chunks`)
