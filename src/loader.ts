import {
  ISceneLoaderAsyncResult,
  Mesh,
  Scene,
  SceneLoader,
  Skeleton,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import {
  BoneHierarchyBase,
  makeSkeletonAnimationClip,
  SkeletonAnimationClip,
} from "./abstructBoneHierarchy";
import { colors } from "./main";

type SkeletalMeshAsyncLoader = (
  scene: Scene,
  root: string
) => (
  fileData: string | File
) => Promise<[bodyMesh: Mesh, bodySkeleton: Skeleton]>;
export const skeletalMeshAsyncLoader: SkeletalMeshAsyncLoader =
  (scene: Scene, root: string) => async (fileData: string | File) =>
    ((
      res: ISceneLoaderAsyncResult
    ): [bodyMesh: Mesh, bodySkeleton: Skeleton] => {
      if (res.skeletons.length > 1) {
        console.warn(
          colors.yellow(`More than 2 skeletons detected for ${res}`)
        );
      }
      const bodySk = ((maybeSK) => {
        if (!maybeSK) {
          console.error(
            colors.yellow(`No "Skeleton" object detected for ${res}.`)
          );
          return new Skeleton("nullSK", "null", scene);
        } else {
          return maybeSK;
        }
      })(res.skeletons[0]);

      const bodyMesh = ((maybeMesh) => {
        if (maybeMesh instanceof Mesh) {
          return maybeMesh;
        } else {
          console.error(colors.yellow(`No "Mesh" object detected for ${res}.`));
          return new Mesh("nullMesh", scene);
        }
      })(res.meshes[0]);
      return [bodyMesh, bodySk];
    })(await SceneLoader.ImportMeshAsync("", root, fileData, scene));

type SkeletonAnimationAsyncLoader = (
  scene: Scene,
  root: string,
  boneHierarchyBase: BoneHierarchyBase
) => (fileData: string | File) => Promise<SkeletonAnimationClip>;

export const skeletonAnimationAsyncLoader: SkeletonAnimationAsyncLoader =
  (scene, root, boneHierarchyBase) => async (fileData: string | File) =>
    ((res: ISceneLoaderAsyncResult) => {
      if (res.skeletons.length > 1) {
        console.warn(
          colors.yellow(`More than 2 skeletons detected for ${res}`)
        );
      }
      const skeleton = ((maybeSK) => {
        if (!maybeSK) {
          console.error(
            colors.yellow(`No "Skeleton" object detected for ${res}.`)
          );
          return new Skeleton("nullSK", "null", scene);
        } else {
          return maybeSK;
        }
      })(res.skeletons[0]);
      const animationClip = makeSkeletonAnimationClip(
        skeleton,
        boneHierarchyBase
      );
      res.animationGroups.forEach((node) => node.dispose());
      res.geometries.forEach((node) => node.dispose());
      res.lights.forEach((node) => node.dispose());
      res.meshes.forEach((node) => node.dispose());
      res.particleSystems.forEach((node) => node.dispose());
      res.skeletons.forEach((node) => node.dispose());
      res.transformNodes.forEach((node) => node.dispose());
      return animationClip;
    })(await SceneLoader.ImportMeshAsync("", root, fileData, scene));
