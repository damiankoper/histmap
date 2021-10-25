import { Controller, Get } from '@nestjs/common';
import { TilesService } from './tiles.service';
import { Data, PreTile } from 'pre-processor/types/types';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import _ from 'lodash';
import { PreTileSet } from 'src/interfaces/pre-tile-set.interface';

@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
  ) {}

  @Get('getTile')
  async getTile(preTileKey: string): Promise<Blob> {
    const mainPreTile = this.dataService.getPreTile(preTileKey);
    const mainPreTileNeighbors = new PreTileSet(this.dataService, mainPreTile);

    // mainPreTileNeighbors[0] = this.filterService.filterPublications(
    //   preTileDataDto.publications,
    // );

    // const c: PreTile = _.cloneDeep(p); // zrobić kopię pretile'ów

    return this.tilesService.calculateTile(mainPreTileNeighbors);
  }
}
