import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Data, PreTile } from 'pre-processor';

@Injectable()
export class DataService {
  private preTileMap: Map<string, PreTile> = new Map();

  constructor() {
    this.initJsonData();
  }

  initJsonData(): void {
    const preData: Data = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../data/data.json'), 'utf-8'),
    );

    preData.preTiles.forEach((preTile) => {
      const key = this.getPreTileKey(
        preTile.t,
        preTile.z,
        preTile.x,
        preTile.y,
      );
      this.preTileMap.set(key, preTile);
    });
  }

  public getPreTileKey(t: number, z: number, x: number, y: number): string {
    return `${t}.${z}.${x}.${y}`;
  }

  public getPreTile(tileKey: string): PreTile {
    try {
      const requestedPreTile: PreTile = this.preTileMap.get(tileKey);

      if (!requestedPreTile) {
        throw new NotFoundException(
          `Requested (${tileKey}) preTile not found.`,
        );
      } else {
        return requestedPreTile;
      }
    } catch (error) {
      throw error;
    }
  }

  public buildNeighbourPreTileKey(
    mainPreTile: PreTile,
    offsetX: number,
    offsetY: number,
  ): string {
    const maxCoord = Math.pow(2, mainPreTile.z);
    let neigbourTileX = mainPreTile.x + offsetX;
    let neigbourTileY = mainPreTile.y + offsetY;

    if (neigbourTileX >= maxCoord) {
      neigbourTileX = neigbourTileX - maxCoord;
    }
    if (neigbourTileX < 0) {
      neigbourTileX = neigbourTileX + maxCoord;
    }

    if (neigbourTileY >= maxCoord) {
      neigbourTileY = neigbourTileY - maxCoord;
    }
    if (neigbourTileY < 0) {
      neigbourTileY = neigbourTileY + maxCoord;
    }

    if (mainPreTile)
      return this.getPreTileKey(
        mainPreTile.t,
        mainPreTile.z,
        neigbourTileX,
        neigbourTileY,
      );
  }
}
