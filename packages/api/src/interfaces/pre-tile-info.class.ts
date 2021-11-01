import { PreTile } from 'pre-processor';

export class preTileInfo {
  private preTile: PreTile;
  private offsetX: number;
  private offsetY: number;

  constructor(preTile: PreTile, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.preTile = preTile;
  }

  public toString = (): string => {
    return `x: ${this.preTile.x} y: ${this.preTile.y}, offsetX: ${this.offsetX}, offsetY: ${this.offsetY}`;
  };

  public getOffsetX(): number {
    return this.offsetX;
  }

  public getOffsetY(): number {
    return this.offsetY;
  }

  public getPreTile(): PreTile {
    return this.preTile;
  }
}
