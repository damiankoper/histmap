export class GeoPoint {
  readonly t: number;
  readonly lon: number;
  readonly lat: number;
  public publications: number[];
  public distanceFromAreaCenter: number;
  constructor(lon: number, lat: number, t: number, p: number[]) {
    this.lon = lon;
    this.lat = lat;
    this.t = t;
    this.publications = p;
  }
}
