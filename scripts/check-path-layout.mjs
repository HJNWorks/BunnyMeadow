import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = fs.readFileSync(path.join(root, "src/modes/story/path.ts"), "utf8")
const block = src.match(/const WORLDS: StoryWorldNode\[\] = \[([\s\S]*?)\n\]/)
if (!block) {
  console.error("Could not find WORLDS in path.ts")
  process.exit(1)
}

const worlds = []
const re = /title:\s*"([^"]+)"[\s\S]*?x:\s*([0-9.]+)[\s\S]*?y:\s*([0-9.]+)/g
let match
while ((match = re.exec(block[1]))) {
  worlds.push({ title: match[1], x: Number(match[2]), y: Number(match[3]) })
}

const frameW = 980
const frameH = 420
const cardW = 160
const cardH = 96
const halfW = (cardW / frameW) * 50
const halfH = (cardH / frameH) * 50
const hits = []

for (let i = 0; i < worlds.length; i += 1) {
  for (let j = i + 1; j < worlds.length; j += 1) {
    const a = worlds[i]
    const b = worlds[j]
    const dx = Math.abs(a.x - b.x)
    const dy = Math.abs(a.y - b.y)
    if (dx < halfW * 2 && dy < halfH * 2) {
      hits.push(`${a.title} overlaps ${b.title} (dx=${dx.toFixed(1)} dy=${dy.toFixed(1)}; need dx>=${(halfW * 2).toFixed(1)} or dy>=${(halfH * 2).toFixed(1)})`)
    }
  }
}

console.log("World nodes:", worlds.map((w) => `${w.title}@${w.x},${w.y}`).join(" | "))
if (hits.length) {
  console.error("Path layout overlaps:")
  for (const hit of hits) {
    console.error(" -", hit)
  }
  process.exit(1)
}
console.log("Path layout clear.")
