import Phaser from "phaser"
import { mountDomShell, requireEl } from "../../ui/DomShell"
import { TaskRunner, type TaskId } from "./TaskRunner"
import { TaskRuntime } from "./TaskRuntime"
import { t } from "../../core/i18n"
import { getAudio } from "../../core/audio"

function shellHtml(): string {
  return `
<div class="bm-shell bm-wide meadow-shell task-shell">
  <header class="meadow-header">
    <div>
      <div class="bm-eyebrow">${t("tasks.select.eyebrow")}</div>
      <h1 data-ui="taskName">${t("mode.tasks")}</h1>
      <p class="bm-tagline">${t("task.run.tagline")}</p>
    </div>
  </header>
  <div class="meadow-bar">
    <span>${t("hud.map")} <strong data-ui="mapName">${t("map.meadow_home")}</strong></span>
    <span>${t("hud.held")} <strong data-ui="score">0 / 0</strong></span>
    <span>${t("hud.hearts")} <strong data-ui="hearts">♥ ♥ ♥</strong></span>
    <span>${t("hud.dash")} <strong data-ui="dash">${t("common.ready")}</strong></span>
    <span data-ui="timerWrap">${t("hud.timer")} <strong data-ui="timer"></strong></span>
    <button type="button" class="bm-btn" data-ui="pause">${t("common.pause")}</button>
    <button type="button" class="bm-btn ghost" data-ui="back">${t("task.run.back")}</button>
  </div>
  <div class="meadow-field">
    <canvas data-ui="canvas" width="960" height="540" aria-label="${t("mode.tasks")}"></canvas>
    <div class="meadow-overlay" data-ui="overlay">
      <div class="meadow-card">
        <div class="emoji">🌙</div>
        <h2 data-ui="title">${t("mode.tasks")}</h2>
        <p data-ui="message">${t("common.ready")}</p>
        <div class="meadow-end-actions">
          <button type="button" class="bm-btn warm" data-ui="play">${t("meadow.intro.play")}</button>
          <button type="button" class="bm-btn ghost" data-ui="toSelect" hidden>${t("task.run.toSelect")}</button>
        </div>
      </div>
    </div>
    <div class="meadow-overlay meadow-pause" data-ui="pausePanel" hidden>
      <div class="meadow-card">
        <h2>${t("common.pause")}</h2>
        <p>${t("task.run.pauseBody")}</p>
        <div class="meadow-pause-actions">
          <button type="button" class="bm-btn warm" data-ui="resume">${t("common.resume")}</button>
          <button type="button" class="bm-btn" data-ui="openSettings">${t("common.settings")}</button>
          <button type="button" class="bm-btn ghost" data-ui="quitSelect">${t("task.run.quit")}</button>
        </div>
      </div>
    </div>
  </div>
  <div class="meadow-touch"><button type="button" class="bm-btn" data-ui="touchDash">${t("hud.dash")}</button></div>
  <footer class="meadow-footer">
    <span>${t("task.footer.keys")}</span>
    <span>${t("task.footer.touch")}</span>
  </footer>
</div>
`
}

const TASK_CSS = `
.meadow-header { display:flex; justify-content:space-between; align-items:center; gap:20px; }
.meadow-header h1 { font-size:42px; margin:6px 0; }
.meadow-bar { display:flex; gap:20px; align-items:center; margin:26px 0 12px; font-size:14px; flex-wrap:wrap; }
.meadow-bar strong { font-size:18px; }
.meadow-bar .bm-btn { margin-left:auto; }
.meadow-bar .bm-btn.ghost { margin-left:0; }
.meadow-field { position:relative; overflow:hidden; border-radius:24px; box-shadow:0 14px 40px #415c3620; background:#b7ce88; }
.meadow-field > canvas[data-ui="canvas"] { display:block; width:100%; aspect-ratio:16/9; touch-action:none; }
.meadow-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#34563835; backdrop-filter:blur(3px); }
.meadow-overlay[hidden] { display:none; }
.meadow-card { max-width:420px; margin:16px; text-align:center; background:#fffaf0; padding:28px; border-radius:24px; box-shadow:0 12px 30px #26432425; }
.meadow-card .emoji { font-size:36px; margin-bottom:12px; }
.meadow-card h2 { font:32px Georgia; margin:0 0 12px; }
.meadow-card p { line-height:1.6; color:#71816e; }
.meadow-end-actions, .meadow-pause-actions { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.meadow-footer { display:flex; justify-content:space-between; gap:16px; color:#71816e; font-size:12px; margin-top:20px; }
.meadow-footer kbd { border:1px solid #c9cfba; padding:3px 6px; border-radius:5px; background:#fffaf0; }
.meadow-touch { display:none; justify-content:center; gap:12px; margin-top:16px; }
@media (pointer:coarse) { .meadow-touch { display:flex; } }
@media (max-width:600px) {
  .meadow-header h1 { font-size:32px; }
  .meadow-bar { gap:12px; font-size:12px; }
  .meadow-bar strong { font-size:15px; }
  .meadow-footer { flex-direction:column; }
}
`

export class TaskRunScene extends Phaser.Scene {
  private runtime: TaskRuntime | null = null
  private style: HTMLStyleElement | null = null
  private taskId: TaskId = "night_watch"

  constructor() {
    super("TaskRun")
  }

  init(data?: { taskId?: TaskId }): void {
    this.taskId = data?.taskId ?? "night_watch"
  }

  create(): void {
    getAudio().playMusic("meadow")
    const started = new TaskRunner().start(this.taskId)
    if (!started.ok) {
      this.scene.start("TaskSelect")
      return
    }

    this.style = document.createElement("style")
    this.style.textContent = TASK_CSS
    document.head.appendChild(this.style)

    const shell = mountDomShell(this, shellHtml())
    const canvas = requireEl<HTMLCanvasElement>(shell.root, "[data-ui=canvas]")
    const task = started.task

    this.runtime = new TaskRuntime(
      canvas,
      {
        score: requireEl(shell.root, "[data-ui=score]"),
        hearts: requireEl(shell.root, "[data-ui=hearts]"),
        dash: requireEl(shell.root, "[data-ui=dash]"),
        timer: requireEl(shell.root, "[data-ui=timer]"),
        mapName: requireEl(shell.root, "[data-ui=mapName]"),
        taskName: requireEl(shell.root, "[data-ui=taskName]"),
        pause: requireEl(shell.root, "[data-ui=pause]"),
        overlay: requireEl(shell.root, "[data-ui=overlay]"),
        title: requireEl(shell.root, "[data-ui=title]"),
        message: requireEl(shell.root, "[data-ui=message]"),
        play: requireEl(shell.root, "[data-ui=play]"),
        toSelect: requireEl(shell.root, "[data-ui=toSelect]"),
        touchDash: requireEl(shell.root, "[data-ui=touchDash]"),
        pausePanel: requireEl(shell.root, "[data-ui=pausePanel]"),
        resume: requireEl(shell.root, "[data-ui=resume]"),
        openSettings: requireEl(shell.root, "[data-ui=openSettings]"),
        quitSelect: requireEl(shell.root, "[data-ui=quitSelect]"),
      },
      {
        onOpenSettings: () => {
          getAudio().playSfx("confirm")
          this.scene.start("Settings", { returnTo: "TaskRun", taskId: this.taskId })
        },
        onQuitToSelect: () => {
          getAudio().playSfx("cancel")
          this.scene.start("TaskSelect")
        },
      },
      task,
    )

    requireEl<HTMLButtonElement>(shell.root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("TaskSelect")
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      getAudio().stopMusic()
      this.disposeRuntime()
    })
    this.events.once(Phaser.Scenes.Events.DESTROY, this.disposeRuntime, this)
  }

  private disposeRuntime(): void {
    this.runtime?.dispose()
    this.runtime = null
    this.style?.remove()
    this.style = null
  }
}
