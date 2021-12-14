import { Injectable } from '@nestjs/common';
import { Publication } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { MathService } from 'src/math/math.service';
import { AreaOptionsDto } from './dto/area-options.dto';
import { GeoPoint } from './models/geo-point.model';

@Injectable()
export class AreaService {
  constructor(
    private dataService: DataService,
    private mathService: MathService,
  ) {}

  getValidPoints(options: AreaOptionsDto): GeoPoint[] {
    let validPoints: GeoPoint[] = [];

    this.dataService.getGeoPoints(options.t, options.z).forEach((point) => {
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

  getValidPublications(validPoints: GeoPoint[]) {
    const validPublicationIds: number[] = [];
    validPoints.forEach((point) => {
      point.publications.forEach((publication) => {
        validPublicationIds.push(publication);
      });
    });

    const uniq = [...new Set(validPublicationIds)];
    const publications: Publication[] = [];
    uniq.forEach((pubId) => {
      publications.push(this.dataService.getPublication(pubId));
    });

    return publications;
  }
}
