import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { Point, TileMetaCoords, TileStats } from 'pre-processor';
import { Tile as RenderTile } from 'renderer';
import { AreaService } from 'src/area/area.service';
import { pool } from 'workerpool';
import { TileOptionsDto } from './dto/tile-options.dto';
import { Tile } from './models/tile.model';

@Injectable()
export class TileRendererService {
  private renderPool = pool(
    // !IMPORTANT: Note that this points to .js file in dist directory
    resolve(__dirname, './workers/renderer.worker.js'),
    { workerType: 'process', minWorkers: 4 },
  );

  public constructor(private areaService: AreaService) {}

  public async render(
    tile: Tile,
    stats: TileStats,
    coords: TileMetaCoords,
    options: TileOptionsDto,
  ) {
    const buffer = await this.renderPool.exec('render', [
      options.c || 'default',
      this.mapToRenderTile(tile.points, coords, options, stats.max),
    ]);
    return Buffer.from(buffer);
  }

  private mapToRenderTile(
    tilePoints: Point[],
    coords: TileMetaCoords,
    options: TileOptionsDto,
    max: number,
  ): RenderTile {
    const points = tilePoints.map((point) => {
      let value = point.publications.length;
      if (options.area && point.areas) {
        value += point.areas.reduce(
          (a, b) => a + this.areaService.getAreaValue(b, coords, options),
          0,
        );
      }
      return { ...point, value };
    });

    const notEmptyPoints = points.filter((p) => p.value > 0);

    return {
      points: notEmptyPoints,
      max,
    };
  }
}
