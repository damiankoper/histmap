export interface Speed {
  description: string;
  delay: number;
}

export const SlowSpeed: Speed = {
  description: "slow",
  delay: 1000,
};

export const NormalSpeed: Speed = {
  description: "normal",
  delay: 500,
};

export const FastSpeed: Speed = {
  description: "fast",
  delay: 250,
};
