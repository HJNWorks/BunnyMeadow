export interface SaveStore {
  read(key: string): Promise<string | null>
  write(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  listKeys(prefix?: string): Promise<string[]>
}

export interface Achievements {
  unlock(id: string): Promise<boolean>
  isUnlocked(id: string): Promise<boolean>
  listUnlocked(): Promise<string[]>
}

export interface WindowControl {
  setFullscreen(enabled: boolean): Promise<void>
  isFullscreen(): boolean
  quit(): void
}

export interface Presence {
  set(status: string): void
  clear(): void
}

export interface Platform {
  readonly kind: "web" | "desktop"
  readonly save: SaveStore
  readonly achievements: Achievements
  readonly window: WindowControl
  readonly presence: Presence
}
