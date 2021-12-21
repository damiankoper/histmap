import { Injectable } from '@nestjs/common';
import { Point, TileMetaCoords, TileStats } from 'pre-processor';
import { Config, RendererService, Tile as RenderTile } from 'renderer';
import { AreaService } from 'src/area/area.service';
import { gradients } from 'src/export';
import { TileOptionsDto } from './dto/tile-options.dto';
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

  public constructor(private areaService: AreaService) {}

  public render(
    tile: Tile,
    stats: TileStats,
    coords: TileMetaCoords,
    options: TileOptionsDto,
  ) {
    return this.renderers[options.c || 'default'].render(
      this.mapToRenderTile(tile.points, coords, options, stats.max),
    );
  }

  private mapToRenderTile(
    tilePoints: Point[],
    coords: TileMetaCoords,
    options: TileOptionsDto,
    max: number,
  ): RenderTile {
    const points = tilePoints.map((point) => {
      let value = point.publications.length;
      if (options.areas && point.areas) {
        // TODO: remove || after data.json file handles areas
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
