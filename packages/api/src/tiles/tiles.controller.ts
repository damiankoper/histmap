import {
  CACHE_MANAGER,
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { TilesService } from './tiles.service';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import { TileCoordsDto } from './dto/tile-coords.dto';
import { TileOptionsDto } from './dto/tile-options.dto';
import { Response } from 'express';
import { TileRendererService } from './tile-renderer.service';
import * as _ from 'lodash';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';

import { TileMetaCoords, TileStats } from 'pre-processor';
import { GlobalStats } from 'src/data/interfaces/global-stats.interface';

@ApiTags('tiles')
@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
    private tileRendererService: TileRendererService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('/stats/global')
  async getGlobalStats(): Promise<GlobalStats> {
    return this.dataService.globalStats;
  }

  @Get('/stats/:t/:z/')
  async getTileStats(@Param() coords: TileMetaCoords): Promise<TileStats> {
    return this.dataService.getTileStats(coords);
  }

  @Get(':t/:z/:x/:y.png')
  @Header('Content-Type', 'image/png')
  async getTile(
    @Param() coords: TileCoordsDto,
    @Query() options: TileOptionsDto, // TODO: future options
    @Res() response: Response,
  ): Promise<void> {
    const renderFromCache = await this.cacheManager.get(
      this.getCacheKey(coords, options),
    );

    if (!renderFromCache) {
      const mainPreTile = this.dataService.getPreTile(coords);
      const tile = this.tilesService.calculateTile(mainPreTile);

      const filteredTile = this.filterService.filter(
        _.cloneDeep(tile),
        options,
      );

      const stats = this.dataService.getTileStats(coords);
      const render = this.tileRendererService.render(filteredTile, stats);

      this.cacheManager.set(this.getCacheKey(coords, options), render);
      response.send(render);
    } else {
      this.cacheManager.set(this.getCacheKey(coords, options), renderFromCache);
      response.send(renderFromCache);
    }
  }

  private getCacheKey(coords: TileCoordsDto, options: TileOptionsDto): string {
    return `${coords.t}.${coords.z}.${coords.x}.${coords.y}.${options.author}.${options.place}.${options.title}`;
  }
}
