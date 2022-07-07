/* eslint-disable no-unused-vars */
import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  Vector3,
} from "@babylonjs/core";
import { skeletalMeshAsyncLoader } from "../loader";
import { assertIsDefined } from "../main";
//

export const exsampleScene = async (scene: Scene): Promise<Scene> => {
  // initialize Scene
  // =====================================================================
  const characterLoader = skeletalMeshAsyncLoader(
    scene,
    "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/scenes/"
  );
  const [dummyBody, dummySkeleton] = await characterLoader("dummy2.babylon");
  dummyBody.receiveShadows = false;
  const camera: ArcRotateCamera = ((camera) => {
    camera.attachControl(true);
    camera.lowerRadiusLimit = 2.0;
    camera.upperRadiusLimit = 10;
    camera.wheelDeltaPercentage = 0.01;
    return camera;
  })(
    new ArcRotateCamera(
      "arcCam1",
      Math.PI / 2,
      Math.PI / 4,
      3.0,
      new Vector3(0, 1.0, 0),
      scene
    )
  );

  const hemiLight = ((light) => {
    light.intensity = 0.6;
    light.specular = Color3.Black();
    return light;
  })(new HemisphericLight("hemiLight1", new Vector3(0, 1, 0), scene));

  const dirLight = ((light) => {
    light.position = new Vector3(0, 5, 5);
    return light;
  })(new DirectionalLight("dirLight1", new Vector3(0, -0.5, -1.0), scene));

  const shadowGenerator = ((sg) => {
    sg.useExponentialShadowMap = true;
    sg.addShadowCaster(dummyBody, true);
    return sg;
  })(new ShadowGenerator(1024, dirLight));

  const environment = ((env) => {
    assertIsDefined(env);
    env.setMainColor(Color3.Gray());
    assertIsDefined(env.ground);
    env.ground.position.y += 0.01;
    env.ground.receiveShadows = true;
    return env;
  })(scene.createDefaultEnvironment({ enableGroundShadow: true }));
  // =====================================================================

  return scene;
};
