import { Scene, Skeleton, Animatable, Bone } from "@babylonjs/core";
import {
  HierarchicalAnimationNode,
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
      undefined,
      from,
      to,
      loop,
      speedRatio,
      onAnimationEnd,
      [],
      onAnimationLoop,
      isAdditive
    );

    const appendAnimFromClip = (node: HierarchicalAnimationNode) => {
      const bone = ((maybeBone) => {
        assertIsDefined(maybeBone);
        return maybeBone;
      })(skeleton.bones[node.id]);
      if (node.children) {
        node.children.forEach((cnode) => appendAnimFromClip(cnode));
        animatable.appendAnimations(bone, [node.animation]);
      } else {
        animatable.appendAnimations(bone, [node.animation]);
      }
    };
    appendAnimFromClip(sac.skeletonAnimation);
    // console.info(`anims num: ${animatable.getAnimations().length}`);
    return animatable;
  };
