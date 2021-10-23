import { Controller, Get } from '@nestjs/common';
import { TilesService } from './tiles.service';
import { Data, PreTile } from 'pre-processor/types/types';
import { FilterService } from '../filter/filter.service';
import { DataService } from 'src/data/data.service';
import _ from 'lodash';

@Controller('tiles')
export class TilesController {
  constructor(
    private tilesService: TilesService,
    private filterService: FilterService,
    private dataService: DataService,
  ) {}

  @Get('getTile')
  async getTile(preTileDataDto: Data): Promise<Blob> {
    preTileDataDto.publications = this.filterService.filterPublications(
      preTileDataDto.publications,
    );

    const p: PreTile = this.dataService.;
    const c: PreTile = _.cloneDeep(p); // zrobić kopię pretile'ów

    return this.tilesService.calculateTile(preTileDataDto);
  }
}
