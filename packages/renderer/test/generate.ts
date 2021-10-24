import { RendererService, Tile } from "../src/main";
import * as fs from "fs";
import * as path from "path";

const renderer = new RendererService({
  radius: 15,
  blur: 10,
  minOpacity: 0.05,
});

const tile: Tile = {
  max: 10,
  points: [],
};

for (let i = 0; i < 100; i++) {
  tile.points.push({
    x: Math.floor(Math.random() * 256),
    y: Math.floor(Math.random() * 256),
    value: Math.floor(Math.random() * 9) + 1,
  });
}

const t = performance.now();
const buffer = renderer.render(tile);
console.log(performance.now() - t);

fs.writeFileSync(path.resolve(__dirname, "result", "result.png"), buffer);
