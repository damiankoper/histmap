import { Injectable } from '@nestjs/common';
import { TileStats } from 'pre-processor';
import { RendererService, Tile as RenderTile } from 'renderer';
import { Tile } from './models/tile.model';

@Injectable()
export class TileRendererService {
  private renderer: RendererService;

  constructor() {
    this.renderer = new RendererService({ blur: 20, radius: 30 });
  }

  public render(tile: Tile, stats: TileStats) {
    return this.renderer.render(this.mapToRenderTile(tile, stats.max));
  }

  private mapToRenderTile(preTile: Tile, max: number): RenderTile {
    return {
      points: preTile.points.map((point) => ({
        ...point,
        value: point.publications.length,
      })),
      max,
    };
  }
}
