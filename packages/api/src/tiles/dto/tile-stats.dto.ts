import { TileMetaCoords } from 'pre-processor';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TileStatsDto implements TileMetaCoords {
  @Type(() => Number)
  @IsNumber()
  z: number;

  @Type(() => Number)
  @IsNumber()
  t: number;
}
