type Handler = (...args: unknown[]) => void

export class EventBus {
  private listeners = new Map<string, Set<Handler>>()

  on(event: string, handler: Handler): void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(handler)
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string, ...args: unknown[]): void {
    const set = this.listeners.get(event)
    if (!set) {
      return
    }
    for (const handler of set) {
      handler(...args)
    }
  }
}

export const bus = new EventBus()
