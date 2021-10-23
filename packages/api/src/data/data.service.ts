import { Injectable } from '@nestjs/common';
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
      const key = this.getTileKey(preTile);
      this.preTileMap.set(key, preTile);
    });
  }

  public getTileKey(preTile: PreTile): string {
    return `${preTile.t}.${preTile.z}.${preTile.x}.${preTile.y}`;
  }
}
