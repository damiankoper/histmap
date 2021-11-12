import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { FilterModule } from 'src/filter/filter.module';
import { TileRendererService } from './tile-renderer.service';
import { TilesController } from './tiles.controller';
import { TilesService } from './tiles.service';

@Module({
  controllers: [TilesController],
  providers: [TilesService, TileRendererService],
  imports: [FilterModule, DataModule],
})
export class TilesModule {}
