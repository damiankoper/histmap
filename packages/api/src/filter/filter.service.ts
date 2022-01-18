import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { Tile } from 'src/tiles/models/tile.model';
import { fuzzy } from 'fast-fuzzy';
import { pool } from 'workerpool';
import { resolve } from 'path';

@Injectable()
export class FilterService {
  private filterPool = pool(
    // !IMPORTANT: Note that this points to .js file in dist directory
    resolve(__dirname, './workers/filter.worker.js'),
    { minWorkers: 4 },
  );

  constructor(private dataService: DataService) {}

  public async filter(tile: Tile, options: TileOptionsDto) {
    for (const point of tile.points) {
      point.publications = await this.filterPublications(
        point.publications,
        options,
      );
    }

    tile.points = tile.points.filter(
      (p) => p.publications.length || p.areas.length,
    );
  }

  public async filterPublications(
    publications: number[],
    options: TileOptionsDto,
  ) {
    return await this.filterPool.exec('filterPublications', [
      publications,
      publications.map((id) => this.dataService.getPublication(id)),
      options,
    ]);
  }
}
