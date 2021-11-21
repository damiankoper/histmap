import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TilesModule } from './tiles/tiles.module';
import { AreaModule } from './area/area.module';

@Module({
  imports: [TilesModule, AreaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
