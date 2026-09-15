export type TaskId = "carrot_rush" | "hide_and_seek" | "night_watch" | "lantern_run" | "daily_moon"

export class TaskRunner {
  readonly registered: TaskId[] = []

  start(_id: TaskId): { ok: false; reason: string } {
    return { ok: false, reason: "Task bodies arrive in M2." }
  }

  list(): TaskId[] {
    return this.registered
  }
}
