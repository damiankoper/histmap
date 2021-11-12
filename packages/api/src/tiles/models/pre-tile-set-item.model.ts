import { PreTile } from 'pre-processor';

export class PreTileSetItem {
  constructor(
    public readonly preTile: PreTile,
    public readonly offsetX: number,
    public readonly offsetY: number,
  ) {}
}
