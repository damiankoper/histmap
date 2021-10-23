import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TilesModule } from './tiles/tiles.module';

@Module({
  imports: [TilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
