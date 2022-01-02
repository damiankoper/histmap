import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GradientName } from '../models/gradients';

export class TileOptionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  c: GradientName;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  area: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  author = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  title = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  place = '';
}
