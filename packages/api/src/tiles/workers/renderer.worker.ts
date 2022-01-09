import { Config, RendererService, Tile } from 'renderer';
import { worker } from 'workerpool';
import { GradientName, gradients } from '../models/gradients';

const commonOptions: Partial<Config> = {
  blur: 20,
  radius: 30,
  minOpacity: 0.3,
};

const renderers: Record<GradientName, RendererService> = {
  default: new RendererService({
    ...commonOptions,
    gradient: gradients.default,
  }),
  heat: new RendererService({
    ...commonOptions,
    gradient: gradients.heat,
  }),
  magma: new RendererService({
    ...commonOptions,
    gradient: gradients.magma,
  }),
  viridis: new RendererService({
    ...commonOptions,
    gradient: gradients.viridis,
  }),
};

function render(color: keyof typeof renderers, tile: Tile) {
  return renderers[color].render(tile);
}

worker({ render });
