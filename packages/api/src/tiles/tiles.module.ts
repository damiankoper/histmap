import { Module } from '@nestjs/common';
import { AreaModule } from 'src/area/area.module';
import { DataModule } from 'src/data/data.module';
import { FilterModule } from 'src/filter/filter.module';
import { MathModule } from 'src/math/math.module';
import { TileRendererService } from './tile-renderer.service';
import { TilesController } from './tiles.controller';
import { TilesService } from './tiles.service';

@Module({
  imports: [FilterModule, DataModule, MathModule, AreaModule],
  controllers: [TilesController],
  providers: [TilesService, TileRendererService],
})
export class TilesModule {}
