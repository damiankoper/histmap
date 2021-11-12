import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import { TilesService } from './tiles.service';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import { TileCoordsDto } from './dto/tile-coords.dto';
import { TileOptionsDto } from './dto/tile-options.dto';
import { Response } from 'express';
import { TileRendererService } from './tile-renderer.service';

@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
    private tileRendererService: TileRendererService,
  ) {}

  @Get(':t/:z/:x/:y.png')
  @Header('Content-Type', 'image/png')
  async getTile(
    @Param() coords: TileCoordsDto,
    @Query() options: TileOptionsDto, // TODO: future options
    @Res() response: Response,
  ): Promise<void> {
    const mainPreTile = this.dataService.getPreTile(coords);
    const tile = this.tilesService.calculateTile(mainPreTile);

    // TODO: filters entrypoint: filterService.filter(tile, options)

    const stats = this.dataService.getTileStats(coords);
    const render = this.tileRendererService.render(tile, stats);
    response.send(render);
  }
}
