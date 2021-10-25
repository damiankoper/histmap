import { PreTile } from 'pre-processor';
import { DataService } from 'src/data/data.service';

export class PreTileSet {
  private preTileSet: preTileInfo[] = [];

  constructor(private dataService: DataService, mainPreTile: PreTile) {
    for (let indexY = -1; indexY < 2; indexY++) {
      for (let indexX = -1; indexX < 2; indexX++) {
        this.preTileSet.push(
          new preTileInfo(
            dataService.getPreTile(
              dataService.buildNeighbourPreTileKey(mainPreTile, indexX, indexY),
            ),
            indexX,
            indexY,
          ),
        );
      }
    }
  }

  public getPreTileSet() {
    return this.preTileSet;
  }
}

class preTileInfo {
  private preTile: PreTile;
  private offsetX: number;
  private offsetY: number;

  constructor(preTile: PreTile, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.preTile = preTile;
  }
}
