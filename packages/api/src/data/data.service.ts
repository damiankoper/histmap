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
import { GlobalStats } from './interfaces/global-stats.interface';
import { GeoPoint } from 'src/area/models/geo-point.model';
import { MathService } from 'src/math/math.service';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);
  private preTileMap: Map<string, PreTile> = new Map();
  private statsMap: Map<string, TileStats> = new Map();
  private publications: Map<number, Publication> = new Map();
  private geoPoints: GeoPoint[] = [];
  public readonly globalStats: GlobalStats = {
    tMin: Infinity,
    tMax: -Infinity,
    zMin: Infinity,
    zMax: -Infinity,
  };

  constructor(private mathService: MathService) {
    this.initJsonData();
  }

  private initJsonData(): void {
    this.logger.log('Loading JSON Tiles file');
    const preData: Data = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../data/data.json'), 'utf-8'),
    );
    this.logger.log('JSON Tiles file loaded');

    preData.preTiles.forEach((preTile) => {
      const key = this.getPreTileKey(preTile);
      this.preTileMap.set(key, preTile);
      preTile.points.forEach((point) => {
        const lat = this.mathService.tile2lat(
          preTile.y + point.y / 256,
          preTile.z,
        );
        const lon = this.mathService.tile2lon(
          preTile.x + point.x / 256,
          preTile.z,
        );
        this.geoPoints.push(
          new GeoPoint(lon, lat, preTile.t, point.publications),
        );
      });
    });

    preData.stats.forEach((tileStats) => {
      const key = this.getTileStatsKey(tileStats);
      this.statsMap.set(key, tileStats);
      this.computeGlobalStats(tileStats);
    });

    preData.publications.forEach((publication) => {
      this.publications.set(publication.id, publication);
    });
  }

  public getPublication(id: number): Publication {
    return this.publications.get(id);
  }

  public getGeoPoints(): GeoPoint[] {
    return this.geoPoints;
  }

  computeGlobalStats(tileStats: TileStats): void {
    this.globalStats.tMax = Math.max(this.globalStats.tMax, tileStats.t);
    this.globalStats.tMin = Math.min(this.globalStats.tMin, tileStats.t);
    this.globalStats.zMax = Math.max(this.globalStats.zMax, tileStats.z);
    this.globalStats.zMin = Math.min(this.globalStats.zMin, tileStats.z);
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
    const neigbourTileY = mainPreTile.y + offsetY;

    if (neigbourTileX >= maxCoord) {
      neigbourTileX = neigbourTileX - maxCoord;
    }
    if (neigbourTileX < 0) {
      neigbourTileX = neigbourTileX + maxCoord;
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
