import { Injectable } from '@nestjs/common';
import { Point, TileStats } from 'pre-processor';
import { RendererService, Tile as RenderTile } from 'renderer';
import { Tile } from './models/tile.model';

@Injectable()
export class TileRendererService {
  private renderer: RendererService;

  constructor() {
    this.renderer = new RendererService({ blur: 20, radius: 30 });
  }

  public render(tile: Tile, stats: TileStats) {
    return this.renderer.render(this.mapToRenderTile(tile.points, stats.max));
  }

  public renderPoints(points: Point[]) {
    return this.renderer.render(this.mapToRenderTile(points, 1000));
  }

  private mapToRenderTile(tilePoints: Point[], max: number): RenderTile {
    return {
      points: tilePoints.map((point) => ({
        ...point,
        value: point.publications.length,
      })),
      max,
    };
  }
}
