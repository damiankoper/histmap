export interface Data {
  publications: Publication[]
  areas: Area[]
  areaStats: AreaStats[]
  preTiles: PreTile[]
  stats: TileStats[]
}

export interface DataDict {
  publications: PublicationDict[]
  areas: AreaDict[]
  areaStats: AreaStatsDict[]
  preTiles: PreTileDict[]
  stats: TileStatsDict[]
}

export interface Publication {
  id: number
  title: string
  author: string
  publicationPlace: string
  year: number
}
export interface PublicationDict {
  i: number
  t: string
  a: string
  p: string
  y: number
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

export interface TileStatsDict extends TileMetaCoords {
  m: number
}

export interface AreaStats {
  id: number,
  z: number
  pointCount: number
}

export interface AreaStatsDict {
  i: number,
  z: number
  p: number
}

export interface Area {
  id: number,
  t: number,
  publications: number[]
}

export interface AreaDict {
  i: number,
  t: number,
  p: number[]
}

export interface PreTile extends TileCoords {
  points: Point[]
}

export interface PreTileDict extends TileCoords {
  p: PointDict[]
}


export interface Point {
  x: number
  y: number
  areas: number[],
  publications: number[]
}

// !If a or p is empty, it is not defined at all
export interface PointDict {
  x: number
  y: number
  a?: number[],
  p?: number[]
}
