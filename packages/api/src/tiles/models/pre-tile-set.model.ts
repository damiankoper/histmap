import { PreTile } from 'pre-processor';
import { PreTileSetItem } from './pre-tile-set-item.model';

export class PreTileSet {
  readonly preTiles: PreTileSetItem[] = [];

  constructor(public readonly mainPreTile: PreTile) {}
}
