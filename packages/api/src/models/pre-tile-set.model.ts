import { PreTile } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { PreTileInfo } from './pre-tile-info.model';

export class PreTileSet {
  readonly preTiles: PreTileInfo[] = [];

  constructor(
    private dataService: DataService, // wydzielić
    public readonly mainPreTile: PreTile,
  ) {
    for (let indexY = -1; indexY <= 1; indexY++) {
      for (let indexX = -1; indexX <= 1; indexX++) {
        const neighbourKey = dataService.buildNeighbourPreTileKey(
          mainPreTile,
          indexX,
          indexY,
        );

        const neighbourPreTile = dataService.getPreTile(neighbourKey);
        const preInfo = new PreTileInfo(neighbourPreTile, indexX, indexY);
        this.preTiles.push(preInfo);
      }
    }
  }
}
