import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Point } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { FilterService } from 'src/filter/filter.service';
import { TileCoordsDto } from 'src/tiles/dto/tile-coords.dto';
import { Tile } from 'src/tiles/models/tile.model';
import { TileRendererService } from 'src/tiles/tile-renderer.service';
import { TilesService } from 'src/tiles/tiles.service';
import { AreaOptionsDto } from './dto/area-options.dto';

@ApiTags('area')
@Controller('area')
export class AreaController {
  constructor(
    private dataService: DataService,
    private filterService: FilterService,
    private tilesService: TilesService,
    private tileRendererService: TileRendererService,
  ) {}

  @Get()
  @Header('Content-Type', 'image/png')
  async getPublicationsInArea(
    @Query() options: AreaOptionsDto,
    @Res() response: Response,
  ): Promise<void> {
    if (options.r > 128) {
      options.r = 128;
    }

    const tileX = this.tilesService.lon2tile(options.lon, 1);
    const tileY = this.tilesService.lat2tile(options.lat, 1);
    const flooredTileX = Math.floor(tileX);
    const flooredTileY = Math.floor(tileY);
    const pinXCoordOnTile = tileX * 256;
    const pinYCoordOnTile = tileY * 256;
    let points: Point[] = [];

    if (options.t) {
      const coords = new TileCoordsDto();
      coords.t = options.t;
      coords.x = flooredTileX;
      coords.y = flooredTileY;
      coords.z = options.z;

      const mainPreTile = this.dataService.getPreTile(coords);
      const tile = this.tilesService.calculateTile(mainPreTile);

      points = points.concat(
        this.tilesService.calculateValidPoints(
          tile,
          pinXCoordOnTile,
          pinYCoordOnTile,
          options.r,
        ),
      );
    }

    if (!options.t) {
      const years = [1999, 2000, 2001, 2002, 2003];
      const tiles: Tile[] = [];
      years.forEach((year) => {
        const coords = new TileCoordsDto();
        coords.t = year;
        coords.x = flooredTileX;
        coords.y = flooredTileY;
        coords.z = options.z;

        const mainPreTile = this.dataService.getPreTile(coords);
        tiles.push(this.tilesService.calculateTile(mainPreTile));
      });

      tiles.forEach((tile) => {
        points = points.concat(
          this.tilesService.calculateValidPoints(
            tile,
            pinXCoordOnTile,
            pinYCoordOnTile,
            options.r,
          ),
        );
      });
    }

    const render = this.tileRendererService.renderPoints(points);
    response.send(render);
  }
}
