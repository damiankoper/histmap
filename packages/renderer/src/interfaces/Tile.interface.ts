export interface Point {
  x: number;
  y: number;
  value: number;
}

export interface Tile {
  size: number;
  max: number;
  points: Point[];
}
