import meadowHome from "../data/maps/meadow_home.json"
import orchardRows from "../data/maps/orchard_rows.json"
import bambooClearing from "../data/maps/bamboo_clearing.json"
import festivalYard from "../data/maps/festival_yard.json"

export type MapVec = { x: number; y: number }

export type MeadowMapDef = {
  id: string
  name: string
  env: string
  palette: { grass: string; path: string; glow: string }
  burrow: MapVec
  playerSpawn: MapVec
  safeRadius: number
  carrotSpawns: MapVec[]
  enemySpawns: MapVec[]
  itemSpawns: MapVec[]
  obstacles: { x: number; y: number; w: number; h: number }[]
  decorations: { count: number; seed: number }
}

const MAPS: Record<string, MeadowMapDef> = {
  meadow_home: meadowHome as MeadowMapDef,
  orchard_rows: orchardRows as MeadowMapDef,
  bamboo_clearing: bambooClearing as MeadowMapDef,
  festival_yard: festivalYard as MeadowMapDef,
}

export const MEADOW_MAP_IDS = Object.keys(MAPS)

export function getMeadowMap(id: string): MeadowMapDef {
  return MAPS[id] ?? MAPS.meadow_home
}

export function listMeadowMaps(): MeadowMapDef[] {
  return MEADOW_MAP_IDS.map((id) => MAPS[id])
}
