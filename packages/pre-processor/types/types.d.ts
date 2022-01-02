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

export interface Area {
    id: number
    t: number
    publications: number[]
}

export interface AreaStats {
    id: number
    z: number
    pointCount: number
}

export interface PreTile {
    x: number
    y: number
    z: number
    t: number
    points: Point[]
}

export interface Point {
    x: number
    y: number
    areas: number[]
    publications: number[]
}

export interface TileStats {
    t: number
    z: number
    max: number
}
