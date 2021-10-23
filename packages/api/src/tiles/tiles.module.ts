import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { FilterModule } from 'src/filter/filter.module';
import { TilesController } from './tiles.controller';
import { TilesService } from './tiles.service';

@Module({
  controllers: [TilesController],
  providers: [TilesService],
  imports: [FilterModule, DataModule],
})
export class TilesModule {}
