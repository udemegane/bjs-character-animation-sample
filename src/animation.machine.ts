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
