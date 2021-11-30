import { Module } from '@nestjs/common';
import { MathModule } from 'src/math/math.module';
import { DataService } from './data.service';

@Module({
  imports: [MathModule],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
