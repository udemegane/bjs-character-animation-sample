/* eslint-disable no-unused-vars */
import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import {
  getAnimationArray,
  makeBoneHierarchyBase,
} from "../abstructBoneHierarchy";
import { beginWeightedAnimationByClip, transitter } from "../animationDriver";
import {
  skeletalMeshAsyncLoader,
  skeletonAnimationAsyncLoader,
} from "../loader";
import { assertIsDefined } from "../main";
import { mannequinCharacter } from "../mannequinCharacter";
//

export const exsampleScene = async (scene: Scene): Promise<Scene> => {
  // scene.getEngine().displayLoadingUI();
  // initialize Scene
  // =====================================================================
  const characterLoader = skeletalMeshAsyncLoader(
    scene,
    "https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/"
  );

  const characterLoaderFrommyLib = skeletalMeshAsyncLoader(
    scene,
    "https://raw.githubusercontent.com/udemegane/bjs-asset-host-analyze/master/public/models/"
  );
  const [dummyBody, dummySkeleton] = await characterLoader("dummy2.babylon");
  dummyBody.receiveShadows = false;
  //  = new StandardMaterial("bodyGreenMat", scene);
  // bodyMat.diffuseColor = Color3.Green();
  // bodyMat.specularColor = new Color3(31 / 255);
  // assertIsDefined(bodyMat);
  const bodyMat = scene.getMaterialByUniqueID(1);
  assertIsDefined(bodyMat);
  // @ts-ignore
  bodyMat.diffuseColor = Color3.Green();
  // bodyMat.
  dummyBody.position = new Vector3(-1.2, 0, 0);

  const [dummy3Body, dummy3Skeleton] = await characterLoader("dummy3.babylon");
  dummy3Body.receiveShadows = false;
  dummy3Body.position = new Vector3(0, 0, 0);

  const [xbotBody, xbotSkeleton] = await characterLoader("Xbot.glb");
  xbotBody.receiveShadows = false;
  xbotBody.position = new Vector3(1.2, 0, 0);

  const boneHierarchyBase = makeBoneHierarchyBase(dummySkeleton, "dummy2SK");
  // console.info(`SK hash: ${boneHierarchyBase.hash}`);
  const animationClip = await skeletonAnimationAsyncLoader(
    scene,
    "https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/",
    boneHierarchyBase
  )("dummy2.babylon");

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
    sg.addShadowCaster(xbotBody, true);
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
  const character = mannequinCharacter(
    scene,
    camera,
    {
      mesh: dummyBody,
      skeleton: dummySkeleton,
      animations: [animationClip],
    },
    true
  );

  const character2 = mannequinCharacter(
    scene,
    camera,
    {
      mesh: xbotBody,
      skeleton: xbotSkeleton,
      animations: [animationClip],
    },
    false
  );

  /*
  const idleAnim = beginWeightedAnimationByClip(scene)(animationClip)(
    dummySkeleton,
    0,
    89,
    1.0,
    true
  );
  const walkAnim = beginWeightedAnimationByClip(scene)(animationClip)(
    dummySkeleton,
    90,
    118,
    0.0,
    true
  );
  const animTransitter = transitter(scene);
  const toWalk = animTransitter(3000, walkAnim, idleAnim);
  toWalk.start();
  */
  return scene;
};
