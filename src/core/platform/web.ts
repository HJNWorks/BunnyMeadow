import type {
  Achievements,
  Platform,
  Presence,
  SaveStore,
  WindowControl,
} from "./types"

const ACHIEVEMENT_KEY = "bunnymeadow.achievements"

class WebSaveStore implements SaveStore {
  async read(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async write(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async listKeys(prefix = ""): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }
    return keys
  }
}

class WebAchievements implements Achievements {
  private async load(): Promise<string[]> {
    const raw = localStorage.getItem(ACHIEVEMENT_KEY)
    if (!raw) {
      return []
    }
    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []
    } catch {
      return []
    }
  }

  private async save(ids: string[]): Promise<void> {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(ids))
  }

  async unlock(id: string): Promise<boolean> {
    const ids = await this.load()
    if (ids.includes(id)) {
      return false
    }
    ids.push(id)
    await this.save(ids)
    return true
  }

  async isUnlocked(id: string): Promise<boolean> {
    const ids = await this.load()
    return ids.includes(id)
  }

  async listUnlocked(): Promise<string[]> {
    return this.load()
  }
}

class WebWindowControl implements WindowControl {
  async setFullscreen(enabled: boolean): Promise<void> {
    if (enabled) {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      return
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }

  isFullscreen(): boolean {
    return Boolean(document.fullscreenElement)
  }

  quit(): void {
    window.close()
  }
}

class WebPresence implements Presence {
  set(_status: string): void {}

  clear(): void {}
}

export function createWebPlatform(): Platform {
  return {
    kind: "web",
    save: new WebSaveStore(),
    achievements: new WebAchievements(),
    window: new WebWindowControl(),
    presence: new WebPresence(),
  }
}
