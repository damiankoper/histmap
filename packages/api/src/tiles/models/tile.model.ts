import { Point, TileCoords } from 'pre-processor';

export class Tile implements TileCoords {
  x: number;
  y: number;
  z: number;
  t: number;
  points: Point[] = [];
}
