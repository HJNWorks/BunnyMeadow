import Phaser from "phaser"
import achievementsData from "../data/achievements.json"
import { t } from "../core/i18n"
import { getAudio } from "../core/audio"
import { getPlatform } from "../core/platform"
import { getSave } from "../core/session"
import { mountDomShell, requireEl } from "../ui/DomShell"
import type { AccessoryOption } from "../core/save"
import { getShippedDash, paintDashPreview, paintMeiIdle } from "../fx/dash"

type AchReward =
  | { kind: "dash"; id: string }
  | { kind: "accessory"; id: AccessoryOption }

const ACH_REWARDS: Record<string, AchReward[]> = {
  BASKET_FULL: [{ kind: "dash", id: "carrot" }],
  WORLD4_CLEAR: [{ kind: "dash", id: "gale" }],
  MOON_RETURN: [
    { kind: "dash", id: "moon" },
    { kind: "accessory", id: "moon-helmet" },
  ],
  KEEPSAKE_FIRST: [{ kind: "accessory", id: "blossom" }],
  KEEPSAKE_EIGHT: [{ kind: "accessory", id: "osmanthus" }],
}

const PREVIEW_W = 96
const PREVIEW_H = 64

function paintReward(canvas: HTMLCanvasElement, reward: AchReward): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }
  const cosmetics = {
    fur: "cream" as const,
    ears: "upright" as const,
    accessory: reward.kind === "accessory" ? reward.id : ("none" as const),
  }
  if (reward.kind === "dash") {
    const def = getShippedDash(reward.id)
    if (!def) {
      return
    }
    paintDashPreview(ctx, canvas.width, canvas.height, cosmetics, def, 0.16, true, [], 0)
    return
  }
  paintMeiIdle(ctx, canvas.width, canvas.height, cosmetics)
}

export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super("Achievements")
  }

  create(): void {
    getAudio().playMusic("menu")
    const save = getSave()
    const unlocked = new Set(save.progress.achievements)

    void getPlatform()
      .achievements.listUnlocked()
      .then((ids) => ids.forEach((id) => unlocked.add(id)))

    const items = achievementsData.achievements
      .map((item) => {
        const got = unlocked.has(item.id)
        const rewards = ACH_REWARDS[item.id] ?? []
        const previews = rewards
          .map(
            (_reward, index) =>
              `<canvas class="bm-ach-preview" width="${PREVIEW_W}" height="${PREVIEW_H}" data-ach="${item.id}" data-reward="${index}" aria-hidden="true"></canvas>`,
          )
          .join("")
        const previewWrap = previews ? `<div class="bm-ach-previews">${previews}</div>` : ""
        return `<li class="bm-ach-row${got ? "" : " locked"}"><div class="bm-ach-copy"><strong>${t(`ach.${item.id}.name`)}</strong> — ${t(`ach.${item.id}.desc`)}${got ? "" : ` (${t("achievements.locked")})`}</div>${previewWrap}</li>`
      })
      .join("")

    const { root } = mountDomShell(
      this,
      `
      <div class="bm-shell">
        <h1>${t("achievements.title")}</h1>
        <ul class="bm-list">${items}</ul>
        <p class="bm-tagline">${t("achievements.footer")}</p>
        <div class="bm-actions bm-start">
          <button type="button" class="bm-btn ghost" data-ui="back">${t("common.back")}</button>
        </div>
      </div>
      `,
    )

    for (const canvas of root.querySelectorAll<HTMLCanvasElement>("canvas.bm-ach-preview")) {
      const id = canvas.dataset.ach ?? ""
      const index = Number(canvas.dataset.reward ?? 0)
      const reward = ACH_REWARDS[id]?.[index]
      if (reward) {
        paintReward(canvas, reward)
      }
    }

    requireEl<HTMLButtonElement>(root, "[data-ui=back]").onclick = () => {
      getAudio().playSfx("cancel")
      this.scene.start("Title")
    }
  }
}
