import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { GradientName } from '../models/gradients';

export class TileOptionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  c: GradientName;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  author: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  @IsString()
  place: string;
}
