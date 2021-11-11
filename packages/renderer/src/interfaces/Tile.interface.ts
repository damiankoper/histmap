export interface Point {
  x: number;
  y: number;
  value: number;
}

export interface Tile {
  max: number;
  points: Point[];
}
