import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { FilterService } from './filter.service';

@Module({
  imports: [DataModule],
  providers: [FilterService],
  exports: [FilterService],
})
export class FilterModule {}
