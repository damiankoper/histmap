import { Module } from '@nestjs/common';
import { MathModule } from 'src/math/math.module';
import { DataService } from './data.service';

@Module({
  providers: [DataService],
  exports: [DataService],
  imports: [MathModule],
})
export class DataModule {}
