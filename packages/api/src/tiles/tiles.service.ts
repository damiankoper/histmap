import { Injectable } from '@nestjs/common';
import { PreTileSet } from 'src/tiles/models/pre-tile-set.model';
import { Tile } from 'src/tiles/models/tile.model';
import { PreTile } from 'pre-processor';
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

  private getPreTileSet(mainPreTile: PreTile): PreTileSet {
    const set = new PreTileSet(mainPreTile);

    for (let indexY = -1; indexY <= 1; indexY++) {
      for (let indexX = -1; indexX <= 1; indexX++) {
        const neighbourPreTile = this.dataService.getNeighbourPreTile(
          mainPreTile,
          indexX,
          indexY,
        );

        const preInfo = new PreTileSetItem(neighbourPreTile, indexX, indexY);
        set.preTiles.push(preInfo);
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

  // wzory z miro, prawdopodobnie do wywalenia
  // private lon2tile(lon, zoom) {
  //   return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  // }

  // private lat2tile(lat, zoom) {
  //   return Math.floor(
  //     ((1 -
  //       Math.log(
  //         Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
  //       ) /
  //         Math.PI) /
  //       2) *
  //       Math.pow(2, zoom),
  //   );
  // }
  // private tile2lon(x, z) {
  //   const longitute = (x / Math.pow(2, z)) * 360 - 180;
  //   return longitute;
  // }

  // private tile2lat(y, z) {
  //   const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  //   const latitude =
  //     (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  //   return latitude;
  // }
}
