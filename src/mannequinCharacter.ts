import {
  ActionManager,
  ExecuteCodeAction,
  KeyboardEventTypes,
  Mesh,
  Observable,
  Scene,
  Skeleton,
  TargetCamera,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  StackPanel,
} from "@babylonjs/gui";
import { SkeletonAnimationClip } from "./abstructBoneHierarchy";
import { characterAnimMachine, TransitPatterns } from "./animation.machine";
import { beginWeightedAnimationByClip, transitter } from "./animationDriver";
import { assertIsDefined } from "./main";
type AnimatedCharacterComponent = {
  mesh: Mesh;
  skeleton: Skeleton;
  animations: SkeletonAnimationClip[];
};
type MannequinCharacter = (
  scene: Scene,
  camera: TargetCamera,
  components: AnimatedCharacterComponent
) => void;

export const StatePatterns = {
  idle: 0,
  walk: 1,
  run: 2,
} as const;
// eslint-disable-next-line no-redeclare
export type StatePatterns = typeof StatePatterns[keyof typeof StatePatterns];

const setupAnimation = (
  scene: Scene,
  animsClip: SkeletonAnimationClip,
  skeleton: Skeleton
) => {
  const initialState = characterAnimMachine.initialState;
  const animatableMaker = beginWeightedAnimationByClip(scene)(animsClip);
  const animTransitter = transitter(scene);
  const idleAnim = animatableMaker(skeleton, 0, 89, 1.0, true);
  const walkAnim = animatableMaker(skeleton, 90, 118, 0.0, true);
  const runAnim = animatableMaker(skeleton, 119, 135, 0.0, true);
  const onTransitObservable: Observable<TransitPatterns> = new Observable();
  // const onChangeStateObservable: Observable<StatePatterns> = new Observable();
  const idleToWalk = animTransitter(200, walkAnim, idleAnim);
  const walkToIdle = animTransitter(200, idleAnim, walkAnim);

  onTransitObservable.add((pattern) => {
    switch (pattern) {
      case TransitPatterns.idleToMove:
        idleToWalk.stop();
        idleToWalk.start();
        break;
      case TransitPatterns.moveToIdle:
        walkToIdle.stop();
        walkToIdle.start();
        break;
    }
  });
  return (pattern: TransitPatterns) => {
    onTransitObservable.notifyObservers(pattern);
  };
  /*
  
  onChangeStateObservable.add((pattern) => {
    switch (pattern) {
      case StatePatterns.idle:
        if (currentAnim === idleAnim) break;
        animTransitter(300, currentAnim, idleAnim);
        currentAnim = idleAnim;
        break;
      case StatePatterns.walk:
        if (currentAnim === walkAnim) break;
        animTransitter(300, currentAnim, walkAnim);
        currentAnim = walkAnim;
        break;
      case StatePatterns.run:
        if (currentAnim === runAnim) break;
        animTransitter(300, currentAnim, runAnim);
        currentAnim = runAnim;
        break;
    }
  });
   return (pattern: StatePatterns) => {
    onChangeStateObservable.notifyObservers(pattern);
  };
  */
};
export const mannequinCharacter: MannequinCharacter = (
  scene,
  camera,
  components
) => {
  const animsClip = components.animations[0];
  assertIsDefined(animsClip);
  const notifyAnimationData = setupAnimation(
    scene,
    animsClip,
    components.skeleton
  );
  (() => {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
      "SimpleUI",
      true,
      scene
    );
    const UiPanel = new StackPanel();
    UiPanel.width = "250px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(UiPanel);
    const toWalk = Button.CreateSimpleButton("toWalk", "To Walk");
    toWalk.width = 0.9;
    toWalk.height = "40px";
    toWalk.color = "white";
    toWalk.background = "black";
    toWalk.onPointerClickObservable.add((info) => {
      notifyAnimationData(TransitPatterns.idleToMove);
    });
    UiPanel.addControl(toWalk);
    const toIdle = Button.CreateSimpleButton("toIdle", "To Idle");
    toIdle.width = 0.9;
    toIdle.height = "40px";
    toIdle.color = "white";
    toIdle.background = "black";
    toIdle.onPointerClickObservable.add((info) => {
      notifyAnimationData(TransitPatterns.moveToIdle);
    });
    UiPanel.addControl(toIdle);
  })();

  /*
  type CharacterMoveLocalDirection = {
    x: number;
    y: number;
  };
  const moveDir: CharacterMoveLocalDirection = {
    x: 0,
    y: 0,
  };
  const decideState = (moveDir: CharacterMoveLocalDirection) => {
    if (moveDir.x + moveDir.y === 0) {
      notifyAnimationData(TransitPatterns.moveToIdle);
    } else {
      notifyAnimationData(TransitPatterns.idleToMove);
    }
  };
  
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: "w",
      },
      () => {
        console.log(`w押された`);

        moveDir.x += 1;
        decideState(moveDir);
      }
    )
  );
  scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
      console.log(`押された`);
      switch (kbInfo.event.code) {
        case "KeyW":
          moveDir.x = 1;
          decideState(moveDir);
          break;
        case "KeyA":
          moveDir.y = -1;
          decideState(moveDir);
          break;
        case "KeyS":
          moveDir.x = -1;
          decideState(moveDir);
          break;
        case "KeyD":
          moveDir.y = 1;
          decideState(moveDir);
          break;
      }
    }
    if (kbInfo.type === KeyboardEventTypes.KEYUP) {
      switch (kbInfo.event.code) {
        case "KeyW":
          moveDir.x = 1;
          decideState(moveDir);
          break;
        case "KeyA":
          moveDir.y -= -1;
          decideState(moveDir);
          break;
        case "KeyS":
          moveDir.x -= -1;
          decideState(moveDir);
          break;
        case "KeyD":
          moveDir.y -= 1;
          decideState(moveDir);
          break;
      }
    }
  });
    */
};
