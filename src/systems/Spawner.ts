import enemiesData from "../data/enemies.json"

export type EnemyArchetype = "chaser" | "patrol" | "ranged_lob" | "reach"

export type EnemyDef = {
  id: string
  archetype: EnemyArchetype
  displayName: string
  senseRange: number
  attackRange: number
  telegraphTime: number
  cooldown: number
  speed: number
  hearts: number
  contactDamage: number
  safeFromAbove: boolean
}

export type SpawnedEnemy = {
  id: string
  archetype: EnemyArchetype
  x: number
  y: number
  phase: number
  speed: number
  senseRange: number
  attackRange: number
  attackCooldown: number
  attackTimer: number
  projectile?: { x: number; y: number; vx: number; vy: number; life: number } | null
  patrolDir: number
}

export class Spawner {
  private defs = new Map(
    (enemiesData.enemies as EnemyDef[]).map((enemy) => [enemy.id, enemy]),
  )

  listEnemyIds(): string[] {
    return [...this.defs.keys()]
  }

  getDef(id: string): EnemyDef | undefined {
    return this.defs.get(id)
  }

  spawn(id: string, x: number, y: number, phase = 0): SpawnedEnemy | null {
    const def = this.defs.get(id)
    if (!def) {
      return null
    }
    return {
      id: def.id,
      archetype: def.archetype,
      x,
      y,
      phase,
      speed: def.speed,
      senseRange: def.senseRange,
      attackRange: def.attackRange,
      attackCooldown: def.cooldown,
      attackTimer: 0,
      projectile: null,
      patrolDir: phase % 2 === 0 ? 1 : -1,
    }
  }

  spawnRoster(
    enemyIds: string[],
    count: number,
    spawns: { x: number; y: number }[],
  ): SpawnedEnemy[] {
    const out: SpawnedEnemy[] = []
    if (enemyIds.length === 0 || spawns.length === 0 || count <= 0) {
      return out
    }
    for (let i = 0; i < count; i += 1) {
      const id = enemyIds[i % enemyIds.length]
      const pos = spawns[i % spawns.length]
      const spawned = this.spawn(id, pos.x, pos.y, i * 1.7)
      if (spawned) {
        out.push(spawned)
      }
    }
    return out
  }
}
