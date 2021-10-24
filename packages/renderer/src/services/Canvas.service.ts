import { Canvas, createCanvas } from "canvas";
import * as tinygradient from "tinygradient";
import { ColorFormats } from "tinycolor2";
import { Config, Point } from "../main";

export class CanvasService {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  private circleCanvas: CanvasImageSource;
  private gradientArray: ColorFormats.RGBA[];

  constructor(private readonly config: Config) {
    this.canvas = createCanvas(config.size, config.size);
    this.ctx = this.canvas.getContext("2d", { alpha: true });

    // Typing bug
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.circleCanvas = this.initCircleCanvas();
    this.gradientArray = this.initGradient();
  }

  public getContext() {
    return this.ctx;
  }

  public getPNGBuffer(): Buffer {
    return this.canvas.toBuffer("image/png", { compressionLevel: 1 });
  }

  public renderPoint(point: Point, max: number) {
    const blur = this.config.blur;
    const radius = this.config.radius;
    this.ctx.globalAlpha = Math.min(
      Math.max(point.value / max, this.config.minOpacity),
      1
    );
    this.ctx.drawImage(
      this.circleCanvas,
      point.x - radius - blur,
      point.y - radius - blur
    );
  }

  public colorize() {
    const size = this.config.size;
    const imageData = this.ctx.getImageData(0, 0, size, size);

    // +4 => RGBA
    for (let i = 0; i < imageData.data.length; i += 4) {
      const color = this.gradientArray[imageData.data[i + 3]]; // +3 => alpha
      imageData.data[i] = color.r;
      imageData.data[i + 1] = color.g;
      imageData.data[i + 2] = color.b;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.config.size, this.config.size);
  }

  private initCircleCanvas() {
    const blur = this.config.blur;
    const radius = this.config.radius;
    const diameter = 2 * radius;
    const circleCanvas = createCanvas(diameter + 2 * blur, diameter + 2 * blur);
    const circleCtx = circleCanvas.getContext("2d", { alpha: true });

    circleCtx.fillStyle = "black";
    circleCtx.shadowColor = "black";
    circleCtx.shadowOffsetX = 2 * radius + blur;
    circleCtx.shadowOffsetY = 2 * radius + blur;
    circleCtx.shadowBlur = blur;

    circleCtx.beginPath();
    circleCtx.arc(-radius, -radius, radius, 0, Math.PI * 2);
    circleCtx.closePath();
    circleCtx.fill();

    return circleCanvas;
  }

  private initGradient() {
    const gradient = tinygradient(this.config.gradient);
    return gradient.hsv(256, "short").map((g) => g.toRgb());
  }
}
