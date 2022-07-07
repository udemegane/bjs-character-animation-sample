import { Engine, KeyboardEventTypes, Scene } from "@babylonjs/core";
import { exsampleScene } from "./scenes/exampleScene";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
const createCanvas = (): HTMLCanvasElement => {
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";
  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.id = "appCanvas";
  document.body.appendChild(canvas);
  return canvas;
};

const prepareInspector = (scene: Scene): Scene => {
  scene.onKeyboardObservable.add((kbinfo) => {
    if (kbinfo.type === KeyboardEventTypes.KEYDOWN) {
      if (kbinfo.event.code === "KeyI") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    }
  });
  return scene;
};

const makeScene =
  (engine: Engine) =>
  (initScene: (scene: Scene) => Scene) =>
  (sceneScript: (scene: Scene) => Scene | Promise<Scene>) => {
    return sceneScript(initScene(new Scene(engine)));
  };

const init = () => {
  const engine: Engine = new Engine(createCanvas(), true);
  window.addEventListener("resize", (ev) => {
    engine.resize();
  });
  main(engine);
};

const main = async (engine: Engine) => {
  const sceneMaker = makeScene(engine)(prepareInspector);
  const scene = await sceneMaker(exsampleScene);
  engine.runRenderLoop(() => {
    scene.render();
  });
};
init();
