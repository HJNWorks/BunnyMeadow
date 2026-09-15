import type { Platform } from "./types"
import { createWebPlatform } from "./web"

let platform: Platform | null = null

export function initPlatform(): Platform {
  if (!platform) {
    platform = createWebPlatform()
  }
  return platform
}

export function getPlatform(): Platform {
  if (!platform) {
    return initPlatform()
  }
  return platform
}

export type { Platform, SaveStore, Achievements, WindowControl, Presence } from "./types"
