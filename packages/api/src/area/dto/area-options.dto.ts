import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { GetManyDefaultRequest } from 'src/paginate/pagination.options.interface';

export class AreaOptionsDto extends GetManyDefaultRequest {
  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  lon: number;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  r: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  t: number;

  page: number;
  limit: number;
}
