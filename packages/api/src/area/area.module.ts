import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { MathModule } from 'src/math/math.module';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

@Module({
  imports: [DataModule, MathModule],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
