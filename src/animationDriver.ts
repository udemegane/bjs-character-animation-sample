import { Scene, Skeleton, Animatable, Bone } from "@babylonjs/core";
import {
  isValiedSkeleton,
  SkeletonAnimationClip,
} from "./abstructBoneHierarchy";
import { assertIsDefined } from "./main";

type BeginWeightedAnimationByClip = (
  scene: Scene
) => (
  sac: SkeletonAnimationClip
) => (
  sk: Skeleton,
  from: number,
  to: number,
  weight: number,
  loop?: boolean,
  speedRatio?: number,
  onAnimationEnd?: () => void,
  targetMask?: (target: any) => boolean,
  onAnimationLoop?: () => void,
  isAdditive?: boolean
) => Animatable;
export const beginWeightedAnimationByClip: BeginWeightedAnimationByClip =
  (scene) =>
  (sac) =>
  (
    skeleton,
    from,
    to,
    weight,
    loop?,
    speedRatio = 1.0,
    onAnimationEnd?,
    targetMask?,
    onAnimationLoop?,
    isAdditive = false
  ) => {
    if (!isValiedSkeleton(skeleton, sac.baseHierarchy)) {
      throw new Error("スケルトンとボーンヒエラルキーが一致しません.");
    }
    const rootBone = skeleton.bones[0];
    assertIsDefined(rootBone);
    const animatable = new Animatable(
      scene,
      rootBone,
      from,
      to,
      loop,
      speedRatio,
      onAnimationEnd,
      [sac.skeletonAnimation.animation],
      onAnimationLoop,
      isAdditive
    );
    /*
      const appendAnimFromClip = (node: ) => {
          if (bone.getChildren().length === 0) {
            animatable.appendAnimations(bone, )
          } else {
              
        }
    } */
    return animatable;
  };
