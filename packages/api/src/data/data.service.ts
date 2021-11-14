import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  Data,
  PreTile,
  Publication,
  TileCoords,
  TileMetaCoords,
  TileStats,
} from 'pre-processor';
import * as _ from 'lodash';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);
  private preTileMap: Map<string, PreTile> = new Map();
  private statsMap: Map<string, TileStats> = new Map();
  private publications: Map<number, Publication> = new Map();

  constructor() {
    this.initJsonData();
  }

  initJsonData(): void {
    this.logger.log('Loading JSON Tiles file');
    const preData: Data = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../data/data.json'), 'utf-8'),
    );
    this.logger.log('JSON Tiles file loaded');

    preData.preTiles.forEach((preTile) => {
      const key = this.getPreTileKey(preTile);
      this.preTileMap.set(key, preTile);
    });

    preData.stats.forEach((tileStats) => {
      const key = this.getTileStatsKey(tileStats);
      this.statsMap.set(key, tileStats);
    });

    preData.publications.forEach((publication) => {
      this.publications.set(publication.id, publication);
    });
  }

  public getPublication(id: number): Publication {
    return this.publications.get(id);
  }

  public getEmptyTile(coords: TileCoords): PreTile {
    return { ...coords, points: [] };
  }

  public getPreTile(coords: TileCoords): PreTile {
    const key = this.getPreTileKey(coords);
    const preTile = this.preTileMap.get(key);
    return preTile ? _.cloneDeep(preTile) : this.getEmptyTile(coords);
  }

  public getEmptyTileStats(coords: TileMetaCoords): TileStats {
    return { t: coords.t, z: coords.z, max: 0 };
  }

  public getTileStats(coords: TileMetaCoords): TileStats {
    const key = this.getTileStatsKey(coords);
    const stats = this.statsMap.get(key);
    return stats || this.getEmptyTileStats(coords);
  }

  public getNeighbourPreTile(
    mainPreTile: PreTile,
    offsetX: number,
    offsetY: number,
  ): PreTile {
    const maxCoord = Math.pow(2, mainPreTile.z);
    let neigbourTileX = mainPreTile.x + offsetX;
    let neigbourTileY = mainPreTile.y + offsetY;

    if (neigbourTileX >= maxCoord) {
      neigbourTileX = neigbourTileX - maxCoord;
    }
    if (neigbourTileX < 0) {
      neigbourTileX = neigbourTileX + maxCoord;
    }

    /**
     * TODO(to discuss): Virtual tiles on max/min Y axis
     */
    if (neigbourTileY >= maxCoord) {
      neigbourTileY = neigbourTileY - maxCoord;
    }
    if (neigbourTileY < 0) {
      neigbourTileY = neigbourTileY + maxCoord;
    }

    return this.getPreTile({
      t: mainPreTile.t,
      z: mainPreTile.z,
      x: neigbourTileX,
      y: neigbourTileY,
    });
  }

  private getPreTileKey(coords: TileCoords): string {
    return `${coords.t}.${coords.z}.${coords.x}.${coords.y}`;
  }

  private getTileStatsKey(coords: TileMetaCoords): string {
    return `${coords.t}.${coords.z}`;
  }
}
