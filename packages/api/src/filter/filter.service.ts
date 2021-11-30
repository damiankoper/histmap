import { Injectable } from '@nestjs/common';
import { Publication } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { Tile } from 'src/tiles/models/tile.model';
import levenshtein from 'js-levenshtein';

@Injectable()
export class FilterService {
  private publicationsInTile: Publication[] = [];
  private filteredPublications: Publication[] = [];

  constructor(private dataService: DataService) {}
  filter(tile: Tile, options: TileOptionsDto) {
    const properties = Object.keys(options);

    tile.points.forEach((point) => {
      point.publications.forEach((publication) => {
        this.publicationsInTile.push(
          this.dataService.getPublication(publication),
        );
      });
    });
    // TODO: paginacja
    let loopCounter = 0;
    properties.forEach((prop) => {
      if (loopCounter == 0) {
        // first loops filters publicationsInTile, another loops filter filteredPublications
        this.filteredPublications = this.publicationsInTile.filter(
          (v) => levenshtein(v[prop], options[prop]) <= 3,
        );
      } else {
        this.filteredPublications = this.filteredPublications.filter(
          (v) => levenshtein(v[prop], options[prop]) <= 3,
        );
      }

      loopCounter++;
    });

    const filteredPublicationsIds = this.removeDuplicates(
      this.filteredPublications,
    ).map((x) => x.id);

    tile.points.forEach((point) => {
      point.publications = point.publications.filter((item) =>
        filteredPublicationsIds.includes(item),
      );
    });

    return tile;
  }

  private removeDuplicates(array: Publication[]) {
    const seen = {};
    return array.filter(function (item) {
      return seen.hasOwnProperty(item.id) ? false : (seen[item.id] = true);
    });
  }
}
