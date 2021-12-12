import { Injectable } from '@nestjs/common';
import { Point, TileStats } from 'pre-processor';
import { Config, RendererService, Tile as RenderTile } from 'renderer';
import { gradients } from 'src/export';
import { GradientName } from './models/gradients';
import { Tile } from './models/tile.model';

@Injectable()
export class TileRendererService {
  readonly commonOptions: Partial<Config> = {
    blur: 20,
    radius: 30,
    minOpacity: 0.3,
  };

  private renderers: Record<GradientName, RendererService> = {
    default: new RendererService({
      ...this.commonOptions,
      gradient: gradients.default,
    }),
    heat: new RendererService({
      ...this.commonOptions,
      gradient: gradients.heat,
    }),
    magma: new RendererService({
      ...this.commonOptions,
      gradient: gradients.magma,
    }),
    viridis: new RendererService({
      ...this.commonOptions,
      gradient: gradients.viridis,
    }),
  };

  public render(tile: Tile, stats: TileStats, colors?: GradientName) {
    return this.renderers[colors || 'default'].render(
      this.mapToRenderTile(tile.points, stats.max),
    );
  }

  private mapToRenderTile(tilePoints: Point[], max: number): RenderTile {
    return {
      points: tilePoints
        .map((point) => ({
          ...point,
          value: point.publications.length,
        }))
        .filter((point) => point.value),
      max,
    };
  }
}
