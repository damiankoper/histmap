import { Injectable } from '@nestjs/common';
import { Publication, TileMetaCoords } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { FilterService } from 'src/filter/filter.service';
import { MathService } from 'src/math/math.service';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { AreaOptionsDto } from './dto/area-options.dto';
import { GeoPoint } from './models/geo-point.model';

@Injectable()
export class AreaService {
  constructor(
    private dataService: DataService,
    private mathService: MathService,
    private filterService: FilterService,
  ) {}

  public getValidPoints(options: AreaOptionsDto): GeoPoint[] {
    let validPoints: GeoPoint[] = [];

    this.dataService.getGeoPoints(options).forEach((point) => {
      const intersectStatus = this.mathService.lanLonIntersects(
        options.lon,
        options.lat,
        options.r,
        point.lon,
        point.lat,
      );

      point.distanceFromAreaCenter = intersectStatus.distance;

      if (intersectStatus.intersects) {
        validPoints.push(point);
      }
    });

    if (options.t || options.t != 0) {
      validPoints = validPoints.filter((point) => point.t == options.t);
    }

    return validPoints.sort((a, b) =>
      a.distanceFromAreaCenter > b.distanceFromAreaCenter
        ? 1
        : b.distanceFromAreaCenter > a.distanceFromAreaCenter
        ? -1
        : 0,
    );
  }

  public getValidPublications(
    validPoints: GeoPoint[],
    options: AreaOptionsDto,
  ) {
    /** Map<areaId, pointCount> */
    const areas = new Map<number, number>();

    const uniqPubs = new Set<number>();
    validPoints.forEach((point) => {
      point.publications.forEach((publication) => {
        uniqPubs.add(publication);
      });
      point.areas.forEach((area) => {
        const count = areas.get(area) || 0;
        areas.set(area, count + 1);
      });
    });

    areas.forEach((pointCount, areaId) => {
      const areaStats = this.dataService.getAreaStats(areaId, options);
      if (pointCount / areaStats.pointCount > 0.33) {
        const areaDetails = this.dataService.getArea(areaId, options.t);
        areaDetails.publications.forEach((pub) => uniqPubs.add(pub));
      }
    });

    const publications: Publication[] = [];
    uniqPubs.forEach((pubId) => {
      publications.push(this.dataService.getPublication(pubId));
    });

    return publications;
  }

  public getAreaValue(
    id: number,
    coords: TileMetaCoords,
    options: TileOptionsDto,
  ): number {
    const area = this.dataService.getArea(id, coords.t);
    const areaStats = this.dataService.getAreaStats(id, coords);
    const publications = this.filterService.filterPublications(
      area.publications,
      options,
    );

    return Math.ceil(publications.length / areaStats.pointCount);
  }
}
