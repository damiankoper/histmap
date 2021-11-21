import { Injectable } from '@nestjs/common';
import { PreTileSet } from 'src/tiles/models/pre-tile-set.model';
import { Tile } from 'src/tiles/models/tile.model';
import { Point, PreTile } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { PreTileSetItem } from './models/pre-tile-set-item.model';

@Injectable()
export class TilesService {
  constructor(private dataService: DataService) {}

  public calculateTile(mainPreTile: PreTile): Tile {
    const set = this.getPreTileSet(mainPreTile);

    const tileSize = 256;
    const gradientRadius = 100;
    const tile = new Tile();

    Object.assign(tile, mainPreTile);

    set.preTiles.forEach((setItem) => {
      if (setItem.preTile !== mainPreTile)
        setItem.preTile.points.forEach((point) => {
          const relativeX = setItem.offsetX * tileSize + point.x;
          const relativeY = setItem.offsetY * tileSize + point.y;

          if (this.intersects(relativeX, relativeY, gradientRadius)) {
            point.x = relativeX;
            point.y = relativeY;
            tile.points.push(point);
          }
        });
    });

    return tile;
  }

  public calculateValidPoints(
    tile: Tile,
    pinXCoordOnTile: number,
    pinYCoordOnTile: number,
    r: number,
  ): Point[] {
    const validPoints: Point[] = [];
    tile.points.forEach((point) => {
      const isIn = this.isPointInsideArea(
        point,
        pinXCoordOnTile,
        pinYCoordOnTile,
        r,
      );

      if (isIn) {
        validPoints.push(point);
      }
    });

    return validPoints;
  }

  public lon2tile(lon, zoom) {
    const result = ((lon + 180) / 360) * Math.pow(2, zoom);
    return result; //floor after getting result to get coord
  }

  public lat2tile(lat, zoom) {
    const result =
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
      Math.pow(2, zoom);
    return result; //floor after getting result to get coord
  }

  public tile2lon(x, z) {
    const longitute = (x / Math.pow(2, z)) * 360 - 180;
    return longitute;
  }

  public tile2lat(y, z) {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    const latitude =
      (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return latitude;
  }

  private getPreTileSet(mainPreTile: PreTile): PreTileSet {
    const set = new PreTileSet(mainPreTile);

    for (let indexY = -1; indexY <= 1; indexY++) {
      for (let indexX = -1; indexX <= 1; indexX++) {
        if (indexX !== 0 || indexY !== 0) {
          const neighbourPreTile = this.dataService.getNeighbourPreTile(
            mainPreTile,
            indexX,
            indexY,
          );

          const preInfo = new PreTileSetItem(neighbourPreTile, indexX, indexY);
          set.preTiles.push(preInfo);
        }
      }
    }

    return set;
  }

  /**
   * @see https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
   */
  private intersects(x: number, y: number, radius: number): boolean {
    const maxOfTile = 256;
    const middleOfTile = maxOfTile / 2;

    const circleDistanceX = Math.abs(x - middleOfTile);
    const circleDistanceY = Math.abs(y - middleOfTile);
    const maxDistance = middleOfTile + radius;

    if (circleDistanceX > maxDistance || circleDistanceY > maxDistance) {
      return false;
    }
    if (circleDistanceX <= middleOfTile || circleDistanceY <= middleOfTile) {
      return true;
    }

    const cornerDistanceSq =
      Math.pow(circleDistanceX - middleOfTile, 2) +
      Math.pow(circleDistanceY - middleOfTile, 2);

    return cornerDistanceSq <= Math.pow(radius, 2);
  }

  /**
   * @see https://stackoverflow.com/questions/481144/equation-for-testing-if-a-point-is-inside-a-circle
   */
  private isPointInsideArea(
    point: Point,
    centerX: number,
    centerY: number,
    radius: number,
  ): boolean {
    return (
      Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2) <
      radius * radius
    );
  }
}
