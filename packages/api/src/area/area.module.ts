import { Module } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { FilterService } from 'src/filter/filter.service';
import { TileRendererService } from 'src/tiles/tile-renderer.service';
import { TilesService } from 'src/tiles/tiles.service';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

@Module({
  controllers: [AreaController],
  providers: [
    AreaService,
    DataService,
    FilterService,
    TilesService,
    TileRendererService,
  ],
})
export class AreaModule {}
