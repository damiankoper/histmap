export class GeoPoint {
  readonly t: number;
  readonly lon: number;
  readonly lat: number;
  public publications: number[];
  public areas: number[];
  public distanceFromAreaCenter: number;

  constructor(lon: number, lat: number, t: number, p: number[], a: number[]) {
    this.lon = lon;
    this.lat = lat;
    this.t = t;
    this.publications = p;
    this.areas = a;
  }
}
