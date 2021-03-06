import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import fs from 'fs';
import zlib from 'zlib';
import { resolve } from 'path';
import {
  Area,
  AreaStats,
  DataDict,
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

import { chain } from 'stream-chain';
import progress from 'progress-stream';

import { parser } from 'stream-json';
import { streamValues } from 'stream-json/streamers/StreamValues';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  private preTile: Map<string, PreTile> = new Map();
  private stats: Map<string, TileStats> = new Map();
  private publications: Map<number, Publication> = new Map();
  private geoPoints: Map<string, GeoPoint[]> = new Map();

  private areas: Map<string, Area> = new Map();
  private areaStats: Map<string, AreaStats> = new Map();

  public readonly globalStats: GlobalStats = {
    tMin: Infinity,
    tMax: -Infinity,
    zMin: Infinity,
    zMax: -Infinity,
  };

  constructor(private mathService: MathService) {
    this.initJsonData();
  }

  private async getData(): Promise<DataDict> {
    const compressedPath = resolve(__dirname, '../../../../data/data');
    const compressedExists = existsSync(compressedPath);
    if (compressedExists) {
      const stat = fs.statSync(compressedPath);
      const str = progress({ length: stat.size, time: 1000 });
      str.on('progress', (p) =>
        this.logger.log(`JSON file processing: ${p.percentage.toFixed(2)}%`),
      );

      return new Promise((resolve, reject) =>
        chain([
          fs
            .createReadStream(compressedPath)
            .pipe(str)
            .pipe(zlib.createGunzip()),
          parser(),
          streamValues(),
          (data) => resolve(data.value),
        ]).on('error', reject),
      );
    } else {
      this.logger.log('Compressed data not found. Trying JSON...');
      const path = resolve(__dirname, '../../../../data/data.json');
      const exists = existsSync(path);
      if (exists) {
        const stat = fs.statSync(path);
        const str = progress({ length: stat.size, time: 1000 });
        str.on('progress', (p) =>
          this.logger.log(`JSON file processing: ${p.percentage.toFixed(2)}%`),
        );

        return new Promise((resolve, reject) =>
          chain([
            fs.createReadStream(path).pipe(str).pipe(parser()),
            streamValues(),
            (data) => resolve(data.value),
          ]).on('error', reject),
        );
      } else {
        throw new Error(
          'Data not found: `data.json` or gzipped `data` file not found!',
        );
      }
    }
  }

  private async initJsonData(): Promise<void> {
    this.logger.log('Loading JSON Tiles file');
    try {
      const preData = await this.getData();
      this.logger.log('JSON Tiles file loaded');

      preData.preTiles.forEach((preTileDict) => {
        const preTile: PreTile = {
          ...preTileDict,
          points: preTileDict.p.map((pointDict) => ({
            ...pointDict,
            areas: pointDict.a || [],
            publications: pointDict.p || [],
          })),
        };

        const key = this.getPreTileKey(preTile);
        this.preTile.set(key, preTile);
        preTile.points.forEach((point) => {
          const key = this.getTileMetaKey(preTile);
          const lat = this.mathService.tile2lat(
            preTile.y + point.y / 256,
            preTile.z,
          );
          const lon = this.mathService.tile2lon(
            preTile.x + point.x / 256,
            preTile.z,
          );
          if (!this.geoPoints.get(key)) {
            this.geoPoints.set(key, []);
          }
          this.geoPoints
            .get(key)
            .push(
              new GeoPoint(
                lon,
                lat,
                preTile.t,
                point.publications,
                point.areas || [],
              ),
            );
        });
      });

      preData.publications.forEach((publicationDict) => {
        const publication: Publication = {
          id: publicationDict.i,
          author: publicationDict.a,
          publicationPlace: publicationDict.p,
          year: publicationDict.y,
          title: publicationDict.t,
        };
        this.publications.set(publication.id, publication);
      });

      preData.stats.forEach((tileStatsDict) => {
        const tileStats: TileStats = { ...tileStatsDict, max: tileStatsDict.m };
        const key = this.getTileMetaKey(tileStats);
        this.stats.set(key, tileStats);
        this.computeGlobalStats(tileStats);
      });

      preData.areas.forEach((tileAreaDict) => {
        const tileArea: Area = {
          ...tileAreaDict,
          id: tileAreaDict.i,
          publications: tileAreaDict.p,
        };
        const key = this.getAreaKey(tileArea.id, tileArea.t);
        this.areas.set(key, tileArea);
      });

      preData.areaStats.forEach((areaStatsDict) => {
        const areaStats: AreaStats = {
          ...areaStatsDict,
          id: areaStatsDict.i,
          pointCount: areaStatsDict.p,
        };
        const key = this.getAreaStatsKey(areaStats.id, areaStats.z);
        this.areaStats.set(key, areaStats);
      });

      this.logger.log('JSON Tiles file processed');
    } catch (e) {
      this.logger.error('JSON Tiles file loading error!');
      this.logger.error(e);
      console.log(e);
    }
  }

  public getPublication(id: number): Publication {
    return this.publications.get(id);
  }

  public getGeoPoints(coords: TileMetaCoords): GeoPoint[] {
    const key = this.getTileMetaKey(coords);
    return this.geoPoints.get(key) || [];
  }

  computeGlobalStats(tileStats: TileStats): void {
    this.globalStats.tMax = Math.max(this.globalStats.tMax, tileStats.t);
    if (tileStats.t > 0)
      this.globalStats.tMin = Math.min(this.globalStats.tMin, tileStats.t);
    this.globalStats.zMax = Math.max(this.globalStats.zMax, tileStats.z);
    this.globalStats.zMin = Math.min(this.globalStats.zMin, tileStats.z);
  }

  public getEmptyTile(coords: TileCoords): PreTile {
    return { ...coords, points: [] };
  }

  public getPreTile(coords: TileCoords): PreTile {
    const key = this.getPreTileKey(coords);
    const preTile = this.preTile.get(key);
    return preTile ? _.cloneDeep(preTile) : this.getEmptyTile(coords);
  }

  public getEmptyTileStats(coords: TileMetaCoords): TileStats {
    return { t: coords.t, z: coords.z, max: 0 };
  }

  public getTileStats(coords: TileMetaCoords): TileStats {
    const key = this.getTileMetaKey(coords);
    const stats = this.stats.get(key);
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

  public getArea(id: number, t: number) {
    return (
      this.areas.get(this.getAreaKey(id, t)) || {
        id: 0,
        t: 0,
        publications: [],
      }
    );
  }

  public getAreaStats(id: number, coords: TileMetaCoords) {
    const key = this.getAreaStatsKey(id, coords.z);
    return this.areaStats.get(key) || { id: 0, t: 0, z: 0, pointCount: 1 };
  }

  private getPreTileKey(coords: TileCoords): string {
    return `${coords.t}.${coords.z}.${coords.x}.${coords.y}`;
  }

  private getTileMetaKey(coords: TileMetaCoords): string {
    return `${coords.t}.${coords.z}`;
  }

  private getAreaKey(id: number, t: number): string {
    return `${t}.${id}`;
  }

  private getAreaStatsKey(id: number, z: number): string {
    return `${z}.${id}`;
  }
}
