import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AreaOptionsDto } from './dto/area-options.dto';
import { AreaService } from './area.service';
import { GetManyDefaultResponse } from 'src/paginate/pagination.options.interface';
import { Publication } from 'pre-processor';

@ApiTags('area')
@Controller('area')
export class AreaController {
  private areaCache = new Map<string, Publication[]>();
  constructor(private areaService: AreaService) {}

  @Get()
  async getPublicationsInArea(
    @Query() options: AreaOptionsDto,
  ): Promise<GetManyDefaultResponse<Publication>> {
    if (options.r > 128) {
      options.r = 128;
    }

    const cacheKey = this.getCacheKey(options);
    const renderFromCache = this.areaCache.get(cacheKey);

    if (!renderFromCache) {
      const validPoints = this.areaService.getValidPoints(options);
      const validPublications =
        this.areaService.getValidPublications(validPoints);

      const page = new GetManyDefaultResponse<Publication>();
      page.pageNumber = options.page ? options.page : 1;
      page.count = options.limit ? options.limit : 20;
      page.total = validPublications.length;
      page.pageCount = Math.ceil(page.total / page.count);
      page.data = validPublications.slice(
        (page.pageNumber - 1) * page.count + 1,
        page.pageNumber * page.count < validPublications.length
          ? page.count * page.pageNumber
          : validPublications.length - 1,
      );

      this.areaCache.set(cacheKey, validPublications);
      return page;
    } else {
      const page = new GetManyDefaultResponse<Publication>();
      page.pageNumber = options.page;
      page.count = options.limit;
      page.total = renderFromCache.length;
      page.pageCount = Math.ceil(page.total / page.count);
      page.data = renderFromCache.slice(
        (page.pageNumber - 1) * page.count + 1,
        page.pageNumber * page.count < renderFromCache.length
          ? page.count * page.pageNumber
          : renderFromCache.length - 1,
      );

      return page;
    }
  }

  private getCacheKey(options: AreaOptionsDto): string {
    return `${options.lat}.${options.lon}.${options.r}.${options.t || ''}`;
  }
}
