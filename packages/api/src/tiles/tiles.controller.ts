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
import { PreTileSet } from 'src/interfaces/pre-tile-set.class';

@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
  ) {}

  @Get('getTile/:preTileKey')
  async getTile(@Param('preTileKey') preTileKey: string): Promise<Blob> {
    let mainPreTile: PreTile;

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

    // TODO: create blob contain preparedTile
    return new Blob();
  }
}
