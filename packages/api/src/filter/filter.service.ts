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

        let authorBool = !options.author.length || false;
        this.splitAndTrim(pub.author).forEach((author) => {
          const authorFuzzy =
            !options.author.length ||
            (author.length && fuzzy(author, options.author) > 0.5);

          authorBool = authorBool || authorFuzzy;
        });

        let pubPlaceBool = !options.place.length || false;
        this.splitAndTrim(pub.publicationPlace).forEach((place) => {
          const pubPlaceFuzzy =
            !options.place.length ||
            (place.length && fuzzy(place, options.place) > 0.5);

          pubPlaceBool = pubPlaceBool || pubPlaceFuzzy;
        });

        return title && authorBool && pubPlaceBool;
      });
    });
  }

  private splitAndTrim(clause: string): string[] {
    const words = clause.split(/[,;]+/);

    for (let index = 0; index < words.length; index++) {
      words[index] = words[index].trim();
    }

    return words;
  }
}
