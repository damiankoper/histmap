import { Injectable } from '@nestjs/common';
import { PreTileSet } from 'src/interfaces/pre-tile-set.class';
import { Tile } from 'src/interfaces/tile.class';
import * as _ from 'lodash';
import { Point } from 'pre-processor';

@Injectable()
export class TilesService {
  calculateTile(preTileDataDto: PreTileSet) {
    const tileSize = 255;
    const gradientRadius = 64;
    const mainPreTile = preTileDataDto.getPreTileSet()[4];
    const finalTile = new Tile();

    finalTile.t = mainPreTile.getPreTile().t;
    finalTile.z = mainPreTile.getPreTile().z;
    finalTile.x = mainPreTile.getPreTile().x;
    finalTile.y = mainPreTile.getPreTile().y;

    preTileDataDto.getPreTileSet().forEach((preTile) => {
      preTile.getPreTile().points.forEach((point) => {
        const relativeX = preTile.getOffsetX() * tileSize + point.x;
        const relativeY = preTile.getOffsetY() * tileSize + point.y;

        if (this.checkIntersection(relativeX, relativeY, gradientRadius)) {
          const c: Point = _.cloneDeep(point);
          c.x = relativeX;
          c.y = relativeY;
          finalTile.points.push(c);
        }
      });
    });

    return finalTile;
  }

  //https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
  private checkIntersection(x: number, y: number, radius: number): boolean {
    const middleOfTile = 128;
    const maxOfTile = 256;

    const circleDistanceX = Math.abs(x - middleOfTile);
    const circleDistanceY = Math.abs(y - middleOfTile);

    if (circleDistanceX > maxOfTile / 2 + radius) {
      return false;
    }
    if (circleDistanceY > maxOfTile / 2 + radius) {
      return false;
    }

    if (circleDistanceX <= maxOfTile / 2) {
      return true;
    }
    if (circleDistanceY <= maxOfTile / 2) {
      return true;
    }

    const cornerDistance_sq = Math.pow(
      Math.pow(
        circleDistanceX - maxOfTile / 2,
        2 + (circleDistanceY - maxOfTile / 2),
      ),
      2,
    );

    return cornerDistance_sq <= (radius ^ 2);
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
