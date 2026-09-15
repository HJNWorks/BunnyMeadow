import { defineConfig } from "vite"

export default defineConfig({
  base: "/BunnyMeadow/",
  server: {
    port: 8080,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
})
