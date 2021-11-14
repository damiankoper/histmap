import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { FilterService } from './filter.service';

@Module({
  providers: [FilterService],
  exports: [FilterService],
  imports: [DataModule],
})
export class FilterModule {}
