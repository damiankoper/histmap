import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import { TilesService } from './tiles.service';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import { TileCoordsDto } from './dto/tile-coords.dto';
import { TileOptionsDto } from './dto/tile-options.dto';
import { Response } from 'express';
import { TileRendererService } from './tile-renderer.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TileMetaCoords, TileStats } from 'pre-processor';
import { GlobalStats } from 'src/data/interfaces/global-stats.interface';

@ApiTags('tiles')
@Controller('tiles')
export class TilesController {
  private tilesCache = new Map<string, Buffer>();

  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
    private tileRendererService: TileRendererService,
  ) {}

  @Get('/stats/global')
  @ApiOperation({
    summary: 'Returns global stats',
  })
  async getGlobalStats(): Promise<GlobalStats> {
    return this.dataService.globalStats;
  }

  @Get('/stats/:t/:z/')
  @ApiOperation({
    summary: 'Returns stats for specific tile',
  })
  async getTileStats(@Param() coords: TileMetaCoords): Promise<TileStats> {
    return this.dataService.getTileStats(coords);
  }

  @Get(':t/:z/:x/:y.png')
  @Header('Content-Type', 'image/png')
  @ApiOperation({
    summary: 'Returns rendered tile as an image',
  })
  @ApiResponse({
    status: 201,
  })
  async getTile(
    @Param() coords: TileCoordsDto,
    @Query() options: TileOptionsDto,
    @Res() response: Response,
  ): Promise<void> {
    const cacheKey = this.getCacheKey(coords, options);
    const renderFromCache = this.tilesCache.get(cacheKey);
    const hasFilters = this.hasFilters(options);

    if (!renderFromCache || hasFilters) {
      const mainPreTile = this.dataService.getPreTile(coords);
      const tile = this.tilesService.calculateTile(mainPreTile);

      this.filterService.filter(tile, options);

      const stats = this.dataService.getTileStats(coords);
      const render = this.tileRendererService.render(
        tile,
        stats,
        coords,
        options,
      );

      response.send(render);
      if (!hasFilters) this.tilesCache.set(cacheKey, render);
    } else {
      response.send(renderFromCache);
    }
  }

  private hasFilters(options: TileOptionsDto) {
    return (
      options.author?.length + options.title?.length + options.place?.length > 0
    );
  }

  private getCacheKey(coords: TileCoordsDto, options: TileOptionsDto): string {
    return `${coords.t}.${coords.z}.${coords.x}.${coords.y}.${options.c}.${options.area}`;
  }
}
