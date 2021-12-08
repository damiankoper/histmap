export const gradients = {
  default: [
    { pos: 0.0, color: 'blue' },
    { pos: 0.4, color: 'blue' },
    { pos: 0.6, color: 'cyan' },
    { pos: 0.7, color: 'lime' },
    { pos: 0.8, color: 'yellow' },
    { pos: 1.0, color: 'red' },
  ],
  viridis: [
    { pos: 0.3, color: '#fde725' },
    { pos: 0.3 + 0.14, color: '#fad151' },
    { pos: 0.3 + 2 * 0.14, color: '#22a884' },
    { pos: 0.3 + 3 * 0.14, color: '#2a788e' },
    { pos: 0.3 + 4 * 0.14, color: '#414487' },
    { pos: 0.3 + 5 * 0.14, color: '#440154' },
  ],
  heat: [
    { pos: 0.0, color: 'white' },
    { pos: 0.65, color: 'orange' },
    { pos: 1, color: 'red' },
  ],
  magma: [
    { pos: 0.3, color: '#f6b48f' },
    { pos: 0.3 + 0.14, color: '#f37651' },
    { pos: 0.3 + 2 * 0.14, color: '#e13342' },
    { pos: 0.3 + 3 * 0.14, color: '#ad1759' },
    { pos: 0.3 + 4 * 0.14, color: '#701f57' },
    { pos: 0.3 + 5 * 0.14, color: '#35193e' },
  ],
};

export interface SingleColorData {
  pos: number;
  color: string;
}

export interface Gradient {
  name: string;
  color: string;
}

export interface GradientData {
  name: string;
  colors: Array<SingleColorData>;
}
