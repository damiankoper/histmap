import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PublicationInfo } from 'pre-processor';

// TODO: Tile drawing + filter options to be passed to renderer
export class TileOptionsDto implements PublicationInfo {
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
