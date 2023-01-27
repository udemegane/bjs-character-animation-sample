const EAnimSequence = {
  Idle: 0,
  Walk: 1,
  Run: 2,
} as const;
// eslint-disable-next-line no-redeclare
export type EAnimSequence = typeof EAnimSequence[keyof typeof EAnimSequence];
export type AnimData = {
  name: string;
  path: string;
  start: number;
  end: number;
};
export const rootPath = "http://localhost:12380/";
export const AnimDataArray: AnimData[] = [
  {
    name: "Idle",
    path: "models/dummy2.babylon",
    start: 0,
    end: 89,
  },
  {
    name: "Walk",
    path: "models/dummy2.babylon",
    start: 90,
    end: 118,
  },
  {
    name: "Run",
    path: "models/dummy2.babylon",
    start: 119,
    end: 135,
  },
];

export const Models = {
  dummy2: {
    name: "dummy2",
    path: "models/dummy2.babylon",
  },
  dummy3: {
    name: "dummy3",
    path: "models/dummy3.babylon",
  },
  Xbot: {
    name: "Xbot",
    path: "models/Xbot.glb",
  },
};
