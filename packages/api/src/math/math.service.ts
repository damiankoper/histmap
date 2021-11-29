import { Injectable } from '@nestjs/common';
import { Point } from 'pre-processor';

@Injectable()
export class MathService {
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

  /**
   * @see https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
   */
  public intersects(x: number, y: number, radius: number): boolean {
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
  public isPointInsideArea(
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

  public lanLonIntersects(
    centerLon: number,
    centerLat: number,
    radius: number,
    lon: number,
    lat: number,
  ): boolean {
    const R = radius; // 6371 Radius of the earth in km
    const dLat = this.toRadians(centerLat - lat);
    const dLon = this.toRadians(centerLon - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(centerLat)) *
        Math.cos(this.toRadians(lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d < radius;
  }

  private toRadians(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
