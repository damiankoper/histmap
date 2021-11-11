import { Tile, Config } from "../main";
import { CanvasService } from "./Canvas.service";

export class RendererService {
  private config: Config;
  private canvasService: CanvasService;

  constructor(config: Partial<Config> = {}) {
    // Defaults
    this.config = Object.assign(
      {
        size: 256,
        radius: 30,
        blur: 0,
        gradient: [
          { pos: 0.4, color: "blue" },
          { pos: 0.6, color: "cyan" },
          { pos: 0.7, color: "lime" },
          { pos: 0.8, color: "yellow" },
          { pos: 1.0, color: "red" },
        ],
        minOpacity: 0.1,
      } as Config,
      config
    );

    this.canvasService = new CanvasService(this.config);
  }

  public render(tile: Tile): Buffer {
    this.canvasService.clear();

    tile.points.forEach((point) => {
      this.canvasService.renderPoint(point, tile.max);
    });

    this.canvasService.colorize();

    return this.canvasService.getPNGBuffer();
  }
}
