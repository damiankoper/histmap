import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({
    status: 201,
    type: GetManyDefaultResponse,
    description: 'Returns list of publications in area and pagination info',
  })
  async getPublicationsInArea(
    @Query() options: AreaOptionsDto,
  ): Promise<GetManyDefaultResponse<Publication>> {
    options.r = options.r / 1000;

    const cacheKey = this.getCacheKey(options);
    const renderFromCache = this.areaCache.get(cacheKey);

    if (!renderFromCache) {
      const validPoints = this.areaService.getValidPoints(options);
      const validPubs = this.areaService.getValidPublications(validPoints);

      this.areaCache.set(cacheKey, validPubs);

      return this.createPage(options, validPubs);
    } else {
      return this.createPage(options, renderFromCache);
    }
  }

  private getCacheKey(options: AreaOptionsDto): string {
    return `${options.lat}.${options.lon}.${options.r}.${options.t || ''}`;
  }

  private createPage(
    options: AreaOptionsDto,
    publications: Publication[],
  ): GetManyDefaultResponse<Publication> {
    const page = new GetManyDefaultResponse<Publication>();
    page.pageNumber = options.page ? options.page : 1;
    page.count = options.limit ? options.limit : 20;
    page.total = publications.length;
    page.pageCount = Math.ceil(page.total / page.count);
    page.data = publications.slice(
      (page.pageNumber - 1) * page.count,
      page.pageNumber * page.count < publications.length
        ? page.count * page.pageNumber
        : publications.length,
    );
    page.count = page.data.length;

    return page;
  }
}
