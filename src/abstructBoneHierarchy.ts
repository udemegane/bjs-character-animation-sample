/**
 * アニメーションを扱う型:
 * animationインスタンスを要素にもつ根付き木
 * 対応するスケルトンを持つ
 *
 * スケルトン
 * べーすとなるスケルトンを受け取る
 * 渡されたスケルトンが一致するか判定
 */
/* WIP!!!!!!!!!!!!!!!!!!!!!!! */

import { Bone, IAnimatable, Skeleton, Animation } from "@babylonjs/core";
import { assertIsDefined } from "./main";

export type HierarchicalAnimationNode = {
  id: number;
  animation: Animation;
  children: HierarchicalAnimationNode[] | undefined;
};
type BoneMetaData = {
  id: number;
  name: string;
};
type HierarchicalBoneDataNode = {
  data: BoneMetaData;
  children: HierarchicalBoneDataNode[] | undefined;
};

export type BoneHierarchyBase = {
  name: string;
  length: number;
  hash: string;
  boneHierarchy: HierarchicalBoneDataNode;
};

export type SkeletonAnimationClip = {
  skeletonAnimation: HierarchicalAnimationNode;
  baseHierarchy: BoneHierarchyBase;
};

export const makeBoneHierarchyBase = (
  skeleton: Skeleton,
  name: string
): BoneHierarchyBase => {
  const rootBone = skeleton.bones[0];
  assertIsDefined(rootBone);
  const rootNode: HierarchicalBoneDataNode = {
    data: {
      id: rootBone.getIndex(),
      name: rootBone.name,
    },
    children: [],
  };
  const constructHierarchy = (
    bone: Bone,
    node: HierarchicalBoneDataNode
  ): [HierarchicalBoneDataNode, string] => {
    node.data = {
      id: bone.getIndex(),
      name: bone.name,
    };
    if (bone.children.length === 0) {
      node.children = undefined;
      return [node, "()"];
    } else {
      const chashArray: string[] = [];
      const cNodeArray: HierarchicalBoneDataNode[] = [];
      const result = bone.children.map((cbone) => {
        return constructHierarchy(cbone, node);
      });
      result.forEach((data) => {
        cNodeArray.push(data[0]);
        chashArray.push(data[1]);
      });
      node.children = cNodeArray;
      return [node, `(${chashArray.sort()})`];
    }
  };
  const [boneHierarchy, hash] = constructHierarchy(rootBone, rootNode);
  return {
    name: name,
    length: skeleton.bones.length,
    hash: hash,
    boneHierarchy: boneHierarchy,
  };
};

const getSkeletonHierarchyHash = (skeleton: Skeleton): string => {
  const constructHash = (bone: Bone): string => {
    if (bone.children.length === 0) {
      return "()";
    } else {
      const chashArray = bone.children.map((cbone) => constructHash(cbone));
      return `(${chashArray.sort()})`;
    }
  };
  const rootBone = skeleton.bones[0];
  assertIsDefined(rootBone);
  return constructHash(rootBone);
};

type IsValiedSkeleton = (
  skeleton: Skeleton,
  boneHierarchy: BoneHierarchyBase
) => boolean;
export const isValiedSkeleton: IsValiedSkeleton = (
  skeleton: Skeleton,
  boneHierarchy: BoneHierarchyBase
) => {
  const skeletonHash = getSkeletonHierarchyHash(skeleton);
  const [mainTree, subTree] = (() => {
    if (skeleton.bones.length > boneHierarchy.length)
      return [skeletonHash, boneHierarchy.hash];
    else return [boneHierarchy.hash, skeletonHash];
  })();
  const compareHierarchy = (mainTree: string, subTree: string): boolean => {
    // 部分一致を許容するとめんどくさすぎるのでとりあえず完全一致で妥協.
    return mainTree === subTree;
  };
  return compareHierarchy(mainTree, subTree);
};

type MakeSkeletonAnimationClip = (
  skeleton: Skeleton,
  boneHierarchy: BoneHierarchyBase
) => SkeletonAnimationClip;

export const makeSkeletonAnimationClip: MakeSkeletonAnimationClip = (
  skeleton,
  boneHierarchy
) => {
  if (!isValiedSkeleton(skeleton, boneHierarchy)) {
    throw new Error(`スケルトンとベースボーンヒエラルキーが一致しません`);
  }
  const constructAnimation = (
    bone: Bone,
    animatables: IAnimatable[]
  ): HierarchicalAnimationNode => {
    const id = bone.getIndex();
    const anims = animatables[id]?.animations;
    assertIsDefined(anims);
    const anim = anims[0];
    assertIsDefined(anim);
    if (bone.children.length === 0) {
      return {
        id: id,
        animation: anim,
        children: undefined,
      };
    } else {
      return {
        id: id,
        animation: anim,
        children: bone
          .getChildren()
          .map((cbone) => constructAnimation(cbone, animatables)),
      };
    }
  };
  const rootBone = skeleton.bones[0];
  assertIsDefined(rootBone);
  return {
    skeletonAnimation: constructAnimation(rootBone, skeleton.getAnimatables()),
    baseHierarchy: boneHierarchy,
  };
};

type GetAnimationArray = (sac: SkeletonAnimationClip) => Animation[];
export const getAnimationArray: GetAnimationArray = (sac) => {
  const anims: Animation[] = [];
  const travarseAnims = (node: HierarchicalAnimationNode) => {
    if (node.children) {
      node.children.forEach((canim) => {
        travarseAnims(canim);
      });
      anims.push(node.animation);
    } else {
      anims.push(node.animation);
    }
  };
  travarseAnims(sac.skeletonAnimation);
  return anims;
};
