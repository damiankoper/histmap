import { SingleColorData, GradientData, Gradient, gradients } from "api";

export function useGradients() {
  const createGradient = (gradient: GradientData) => {
    const parts: string[] = [];
    gradient.colors.forEach((p: SingleColorData) => {
      parts.push(`${p.color} ${p.pos * 100}%`);
    });

    const obj: Gradient = {
      name: gradient.name,
      color: `linear-gradient(to right,${parts.join(", ")})`,
    };
    return obj;
  };

  const defaultGradientData: GradientData = {
    colors: gradients.default,
    name: "default",
  };
  const viridisGradientData: GradientData = {
    colors: gradients.viridis,
    name: "viridis",
  };
  const heatGradientData: GradientData = {
    colors: gradients.heat,
    name: "heat",
  };
  const magmaGradientData: GradientData = {
    colors: gradients.magma,
    name: "magma",
  };

  const defaultGradient = createGradient(defaultGradientData);
  const viridisGradient = createGradient(viridisGradientData);
  const heatGradient = createGradient(heatGradientData);
  const magmaGradient = createGradient(magmaGradientData);

  return { defaultGradient, viridisGradient, heatGradient, magmaGradient };
}
