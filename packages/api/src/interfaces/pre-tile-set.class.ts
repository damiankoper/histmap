import { PreTile } from 'pre-processor';
import { DataService } from 'src/data/data.service';
import { preTileInfo } from './pre-tile-info.class';

export class PreTileSet {
  private preTileSet: preTileInfo[] = [];

  constructor(private dataService: DataService, mainPreTile: PreTile) {
    for (let indexY = -1; indexY <= 1; indexY++) {
      for (let indexX = -1; indexX <= 1; indexX++) {
        const neighbourKey = dataService.buildNeighbourPreTileKey(
          mainPreTile,
          indexX,
          indexY,
        );

        const neighbourPreTile = dataService.getPreTile(neighbourKey);
        const preInfo = new preTileInfo(neighbourPreTile, indexX, indexY);
        this.preTileSet.push(preInfo);
      }
    }
  }

  public getPreTileSet() {
    return this.preTileSet;
  }
}
