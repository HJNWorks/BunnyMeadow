import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = fs.readFileSync(path.join(root, "src/modes/story/path.ts"), "utf8")

function parsePosBlock(name) {
  const match = src.match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) {
    throw new Error(`Could not find ${name} in path.ts`)
  }
  const worlds = []
  const re = /(\w+):\s*\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+)\s*\}/g
  let hit
  while ((hit = re.exec(match[1]))) {
    worlds.push({ id: hit[1], title: hit[1], x: Number(hit[2]), y: Number(hit[3]) })
  }
  return worlds
}

function checkLayout(label, worlds, frameW, frameH, cardW, cardH) {
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
        hits.push(
          `${a.title} overlaps ${b.title} (dx=${dx.toFixed(1)} dy=${dy.toFixed(1)}; need dx>=${(halfW * 2).toFixed(1)} or dy>=${(halfH * 2).toFixed(1)})`,
        )
      }
    }
  }
  console.log(
    `${label} nodes:`,
    worlds.map((w) => `${w.title}@${w.x},${w.y}`).join(" | "),
  )
  if (hits.length) {
    console.error(`${label} overlaps:`)
    for (const hit of hits) {
      console.error(" -", hit)
    }
    process.exit(1)
  }
}

const ink = parsePosBlock("INK_POS")
const art = parsePosBlock("ART_POS")
const ch2Ink = parsePosBlock("CH2_INK_POS")
const ch2Art = parsePosBlock("CH2_ART_POS")
checkLayout("Ink", ink, 980, 420, 160, 96)
checkLayout("Art", art, 1100, 620, 124, 78)
checkLayout("Ch2 Ink", ch2Ink, 980, 420, 160, 96)
checkLayout("Ch2 Art", ch2Art, 1100, 620, 124, 78)
console.log("Path layout clear.")
