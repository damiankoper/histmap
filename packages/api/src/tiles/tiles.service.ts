import { Injectable } from '@nestjs/common';
import { Data } from 'pre-processor/types/types';

@Injectable()
export class TilesService {
  calculateTile(preTileDataDto: Data) {
    const informationBlob: Blob = new Blob();

    const mainX = preTileDataDto.preTiles[4].x;
    const mainY = preTileDataDto.preTiles[4].y;

    preTileDataDto.preTiles.forEach((preTile) => {
      preTile.points.forEach((point) => {
        const relativeX = (preTile.x - mainX) * 256 + point.x;
        const relativeY = (preTile.y - mainY) * 256 + point.y;
      });
    });

    const blob = new Blob([JSON.stringify(informationBlob, null, 2)], {
      type: 'application/json',
    });

    return blob;
  }

  private lon2tile(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }

  private lat2tile(lat, zoom) {
    return Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom),
    );
  }
  private tile2lon(x, z) {
    const longitute = (x / Math.pow(2, z)) * 360 - 180;
    return longitute;
  }

  private tile2lat(y, z) {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    const latitude =
      (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return latitude;
  }
}
