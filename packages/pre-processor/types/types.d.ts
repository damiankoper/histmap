export interface Data {
  publications: Publication[]
  areas: Area[]
  areaStats: AreaStats[]
  preTiles: PreTile[]
  stats: TileStats[]
}

export interface Publication {
  id: number
  title: string
  author: string
  publicationPlace: string
  year: number
}

export interface TilePositionCoords {
  x: number
  y: number
}

export interface TileMetaCoords {
  z: number
  t: number
}

export interface TileCoords extends TileMetaCoords, TilePositionCoords { }

export interface TileStats extends TileMetaCoords {
  max: number
}

export interface AreaStats {
  id: number,
  z: number
  pointCount: number
}

export interface Area {
  id: number,
  t: number,
  publications: number[]
}

export interface PreTile extends TileCoords {
  points: Point[]
}

export interface Point {
  x: number
  y: number
  areas: number[],
  publications: number[]
}
