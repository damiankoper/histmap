import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PublicationInfo } from 'pre-processor';

// TODO: Tile drawing + filter options to be passed to renderer
export class TileOptionsDto implements PublicationInfo {
  @IsOptional()
  @Type(() => String)
  @IsString()
  author: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  title: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  place: string;
}
