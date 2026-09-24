import { defineConfig, type Plugin } from "vite"
import fs from "node:fs"
import path from "node:path"

function bunnyMeadowDevWrite(): Plugin {
  return {
    name: "bunnymeadow-dev-write",
    configureServer(server) {
      server.middlewares.use("/__bm/write", (req, res, next) => {
        if (req.method !== "POST") {
          next()
          return
        }
        const chunks: Buffer[] = []
        req.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk))
        })
        req.on("end", () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
              path?: string
              contents?: string
            }
            const relative = body.path ?? ""
            if (
              relative.includes("..") ||
              !relative.startsWith("src/data/") ||
              typeof body.contents !== "string"
            ) {
              res.statusCode = 400
              res.end("bad path")
              return
            }
            const dest = path.resolve(server.config.root, relative)
            const root = path.resolve(server.config.root, "src/data")
            if (!dest.startsWith(root)) {
              res.statusCode = 400
              res.end("bad path")
              return
            }
            fs.mkdirSync(path.dirname(dest), { recursive: true })
            fs.writeFileSync(dest, body.contents, "utf8")
            res.statusCode = 200
            res.end("ok")
          } catch {
            res.statusCode = 400
            res.end("bad body")
          }
        })
      })
    },
  }
}

export default defineConfig({
  base: "/games/bunny-meadow/",
  plugins: [bunnyMeadowDevWrite()],
  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
})
