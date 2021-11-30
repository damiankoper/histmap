import { Injectable } from '@nestjs/common';
import { PreTileSet } from 'src/tiles/models/pre-tile-set.model';
import { Tile } from 'src/tiles/models/tile.model';
import { PreTile } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { PreTileSetItem } from './models/pre-tile-set-item.model';
import { MathService } from 'src/math/math.service';

@Injectable()
export class TilesService {
  constructor(
    private dataService: DataService,
    private mathService: MathService,
  ) {}

  public calculateTile(mainPreTile: PreTile): Tile {
    const set = this.getPreTileSet(mainPreTile);

    const tileSize = 256;
    const gradientRadius = 100;
    const tile = new Tile();

    Object.assign(tile, mainPreTile);

    set.preTiles.forEach((setItem) => {
      if (setItem.preTile !== mainPreTile)
        setItem.preTile.points.forEach((point) => {
          const relativeX = setItem.offsetX * tileSize + point.x;
          const relativeY = setItem.offsetY * tileSize + point.y;

          if (
            this.mathService.intersects(relativeX, relativeY, gradientRadius)
          ) {
            point.x = relativeX;
            point.y = relativeY;
            tile.points.push(point);
          }
        });
    });

    return tile;
  }

  private getPreTileSet(mainPreTile: PreTile): PreTileSet {
    const set = new PreTileSet(mainPreTile);

    for (let indexY = -1; indexY <= 1; indexY++) {
      for (let indexX = -1; indexX <= 1; indexX++) {
        if (indexX !== 0 || indexY !== 0) {
          const neighbourPreTile = this.dataService.getNeighbourPreTile(
            mainPreTile,
            indexX,
            indexY,
          );

          const preInfo = new PreTileSetItem(neighbourPreTile, indexX, indexY);
          set.preTiles.push(preInfo);
        }
      }
    }

    return set;
  }
}
