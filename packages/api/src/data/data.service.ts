import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Data, PreTile } from 'pre-processor';
import { isNullOrUndefined } from 'util';

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
      const key = this.getPreTileKey(preTile);
      this.preTileMap.set(key, preTile);
    });
  }

  public getPreTileKey(preTile: PreTile): string {
    return `${preTile.t}.${preTile.z}.${preTile.x}.${preTile.y}`;
  }

  public getPreTile(tileKey: string): PreTile {
    try {
      return this.preTileMap.get(tileKey);
    } catch (error) {}
  }

  public buildNeighbourPreTileKey(
    mainPreTile: PreTile,
    offsetX: number,
    offsetY: number,
  ): string {
    if (!isNullOrUndefined(mainPreTile))
      return `${mainPreTile.t}.${mainPreTile.t}.${mainPreTile.x + offsetX}.${
        mainPreTile.y + offsetY
      }`;
  }
}
