import { PreTile } from 'pre-processor';

export class preTileInfo {
  private preTile: PreTile;
  private offsetX: number;
  private offsetY: number;

  constructor(preTile: PreTile, offsetX: number, offsetY: number) {
    const maxCoord = Math.pow(2, preTile.z);
    let neigbourTileX = preTile.x + offsetX;
    let neigbourTileY = preTile.y + offsetY;

    if (neigbourTileX >= maxCoord) {
      neigbourTileX = preTile.x - maxCoord;
    }
    if (neigbourTileX < 0) {
      neigbourTileX = preTile.x + maxCoord;
    }

    if (neigbourTileY >= maxCoord) {
      neigbourTileY = preTile.y - maxCoord;
    }
    if (neigbourTileY < 0) {
      neigbourTileY = preTile.y + maxCoord;
    }

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
