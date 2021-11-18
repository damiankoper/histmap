export interface Data {
    publications: Publication[]
    preTiles: PreTile[]
    stats: TileStats[]
}


export interface Publication {
    id: number
    title: string
    author: string
    places: string[]
    year: number
}

export interface TilePositionCoords{
  x: number
  y: number
}
export interface TileMetaCoords{
  z: number
  t: number
}

export interface TileCoords extends TileMetaCoords, TilePositionCoords{}

export interface TileStats extends TileMetaCoords {
  max: number
}


export interface PreTile extends TileCoords{
    points: Point[]
}

export interface Point {
    x: number
    y: number
    publications: number[]
}

export interface PublicationInfo {
  title: string
  author: string
  place: string
}