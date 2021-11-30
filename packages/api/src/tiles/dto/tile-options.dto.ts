import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class TileOptionsDto {
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
