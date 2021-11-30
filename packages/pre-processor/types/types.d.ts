export interface Data {
    publications: Publication[]
    preTiles: PreTile[]
    stats: TileStats[]
}

export interface TileStats {
    t: number
    z: number
    max: number
}

export interface Publication {
    id: number
    title: string
    author: string
    publicationPlace: string
    places: string[]
    year: number
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
    publications: number[]
}