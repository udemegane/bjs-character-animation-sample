/* eslint-disable no-unused-vars */
import { ArcRotateCamera, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export const exsampleScene = async (scene: Scene): Promise<Scene> => {
  const camera: ArcRotateCamera = ((camera) => {
    camera.attachControl(true);
    return camera;
  })(new ArcRotateCamera("arcCam", 0, 0, 3.0, new Vector3(0, 1.0, 0), scene));
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1.0 }, scene);
  return scene;
};
