import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { TilesService } from './tiles.service';
import { PreTile } from 'pre-processor/types/types';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import { PreTileSet } from 'src/models/pre-tile-set.model';

@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
  ) {}

  @Get(':t/:z/:x/:y.png')
  async getTile(
    @Param('t') t: number,
    @Param('z') z: number,
    @Param('x') x: number,
    @Param('y') y: number,
  ): Promise<Blob> {
    let mainPreTile: PreTile;

    const preTileKey = this.dataService.getPreTileKey(t, z, x, y);

    try {
      mainPreTile = this.dataService.getPreTile(preTileKey);
    } catch (NotFoundException) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const mainPreTileAndNeighbours = new PreTileSet( //środkowy element to main
      this.dataService,
      mainPreTile,
    );

    const preparedTile = this.tilesService.calculateTile(
      mainPreTileAndNeighbours,
    );

    // TODO: create and return blob containing preparedTile
    return new Blob();
  }
}
