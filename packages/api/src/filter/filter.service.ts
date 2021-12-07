import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { Tile } from 'src/tiles/models/tile.model';
import { fuzzy } from 'fast-fuzzy';

@Injectable()
export class FilterService {
  constructor(private dataService: DataService) {}

  public filter(tile: Tile, options: TileOptionsDto) {
    options.author = options?.author || '';
    options.title = options?.title || '';
    options.place = options?.place || '';

    tile.points.forEach((point) => {
      point.publications = point.publications.filter((id) => {
        const pub = this.dataService.getPublication(id);

        const title =
          !options.title.length ||
          (pub.title.length &&
            fuzzy(pub.title, options.title, { ignoreCase: true }) > 0.5);

        const author =
          !options.author.length ||
          (pub.author.length && fuzzy(pub.author, options.author) > 0.5);

        const place =
          !options.place.length ||
          (pub.publicationPlace.length &&
            fuzzy(pub.publicationPlace, options.place) > 0.5);

        return title && author && place;
      });
    });
  }
}
