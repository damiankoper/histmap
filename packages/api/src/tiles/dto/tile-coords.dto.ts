import { TileCoords } from 'pre-processor';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TileCoordsDto implements TileCoords {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  x: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  y: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  z: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  t: number;
}
