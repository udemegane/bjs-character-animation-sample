import { createMachine } from "xstate";

export const characterAnimMachine = createMachine({
  tsTypes: {} as import("./animation.machine.typegen").Typegen0,
  id: "Simple Character Animation State",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        idleToMove: {
          target: "Move",
        },
      },
    },
    Move: {
      on: {
        moveToIdle: {
          target: "Idle",
        },
      },
    },
  },
});

export const TransitPatterns = {
  idleToMove: 0,
  moveToIdle: 1,
} as const;
// eslint-disable-next-line no-redeclare
export type TransitPatterns =
  typeof TransitPatterns[keyof typeof TransitPatterns];
