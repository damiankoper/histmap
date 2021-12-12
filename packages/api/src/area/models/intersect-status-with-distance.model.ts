export class IntersectStatusWithDistance {
  readonly intersects: boolean;
  readonly distance: number;
  constructor(intersects: boolean, distance: number) {
    this.intersects = intersects;
    this.distance = distance;
  }
}
