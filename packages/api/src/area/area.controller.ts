import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { DataService } from 'src/data/data.service';
import { AreaOptionsDto } from './dto/area-options.dto';
import { MathService } from 'src/math/math.service';
import { GeoPoint } from './models/geo-point.model';

@ApiTags('area')
@Controller('area')
export class AreaController {
  constructor(
    private dataService: DataService,
    private mathService: MathService,
  ) {}

  @Get()
  @Header('Content-Type', 'image/png')
  async getPublicationsInArea(
    @Query() options: AreaOptionsDto,
    @Res() response: Response,
  ): Promise<void> {
    if (options.r > 128) {
      options.r = 128;
    }

    const tileX = this.mathService.lon2tile(options.lon, 1); //tile z wartością po przecinku
    const tileY = this.mathService.lat2tile(options.lat, 1);
    const flooredTileX = Math.floor(tileX); // tile X
    const flooredTileY = Math.floor(tileY); // Tile Y
    const pinXCoordOnTile = tileX * 256; // współrzędna X środka okręgu
    const pinYCoordOnTile = tileY * 256; // współrzędna Y środka okręgu
    const validPoints: GeoPoint[] = [];

    this.dataService.getGeoPoints().forEach((point) => {
      const doesIntersect = this.mathService.lanLonIntersects(
        options.lon,
        options.lat,
        options.r,
        point.lon,
        point.lat,
      );

      if (doesIntersect) {
        validPoints.push(point);
      }
    });

    if (options.t) {
      const filteredValidPoints = validPoints.filter(
        (point) => point.t == options.t,
      );

      response.send(filteredValidPoints);
    }

    response.send(validPoints);
  }
}
