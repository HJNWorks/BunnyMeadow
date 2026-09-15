import enemiesData from "../data/enemies.json"

export class Spawner {
  listEnemyIds(): string[] {
    return enemiesData.enemies.map((enemy) => enemy.id)
  }

  spawn(_id: string, _x: number, _y: number): null {
    return null
  }
}
