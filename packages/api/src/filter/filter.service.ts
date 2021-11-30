import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { Tile } from 'src/tiles/models/tile.model';
import levenshtein from 'js-levenshtein';

@Injectable()
export class FilterService {
  constructor(private dataService: DataService) {}

  public filter(tile: Tile, options: TileOptionsDto) {
    tile.points.forEach((point) => {
      point.publications = point.publications.filter((id) => {
        const pub = this.dataService.getPublication(id);

        const title =
          !options.title?.length || levenshtein(pub.title, options.title) <= 3;

        const author =
          !options.author?.length ||
          levenshtein(pub.author, options.author) <= 3;

        const place =
          !options.place?.length ||
          pub.places.some((place) => levenshtein(place, options.place) <= 3);

        return title && author && place;
      });
    });
  }
}
