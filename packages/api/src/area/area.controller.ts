import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AreaOptionsDto } from './dto/area-options.dto';
import { AreaService } from './area.service';
import { Publication } from 'pre-processor';
import { GetManyDefaultResponse } from 'src/common/interfaces/pagination.options.interface';

@ApiTags('area')
@Controller('area')
export class AreaController {
  private areaCache = new Map<string, Publication[]>();
  constructor(private areaService: AreaService) {}

  @Get()
  @ApiOperation({
    summary: 'Returns list of publications in area and pagination info',
  })
  @ApiResponse({
    status: 201,
    type: GetManyDefaultResponse,
  })
  async getPublicationsInArea(
    @Query() options: AreaOptionsDto,
  ): Promise<GetManyDefaultResponse<Publication>> {
    options.r = options.r / 1000;

    const cacheKey = this.getCacheKey(options);
    const pubsFromCache = this.areaCache.get(cacheKey);

    if (!pubsFromCache) {
      const validPoints = this.areaService.getValidPoints(options);
      const validPubs = this.areaService.getValidPublications(
        validPoints,
        options,
      );

      this.areaCache.set(cacheKey, validPubs);

      return this.createPage(options, validPubs);
    } else {
      return this.createPage(options, pubsFromCache);
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
