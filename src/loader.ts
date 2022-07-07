import {
  ISceneLoaderAsyncResult,
  Mesh,
  Scene,
  SceneLoader,
  Skeleton,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { colors } from "./main";

export const skeletalMeshAsyncLoader =
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
