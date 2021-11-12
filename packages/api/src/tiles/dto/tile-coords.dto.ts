import { TileCoords } from 'pre-processor';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TileCoordsDto implements TileCoords {
  @Type(() => Number)
  @IsNumber()
  x: number;

  @Type(() => Number)
  @IsNumber()
  y: number;

  @Type(() => Number)
  @IsNumber()
  z: number;

  @Type(() => Number)
  @IsNumber()
  t: number;
}
