import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TilesModule } from './tiles/tiles.module';
import { AreaModule } from './area/area.module';
import { MathModule } from './math/math.module';

@Module({
  imports: [TilesModule, AreaModule, MathModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
