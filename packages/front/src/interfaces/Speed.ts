export enum Speed {
  SLOW = "slow",
  NORMAL = "normal",
  FAST = "fast",
}

export const delaySettings: Record<Speed, number> = {
  [Speed.SLOW]: 1000,
  [Speed.NORMAL]: 500,
  [Speed.FAST]: 250,
};
