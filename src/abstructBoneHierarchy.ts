/**
 * アニメーションを扱う型:
 * animationインスタンスを要素にもつ根付き木
 * 対応するスケルトンを持つ
 *
 * スケルトン
 * べーすとなるスケルトンを受け取る
 * 渡されたスケルトンが一致するか判定
 */

import { Bone, Skeleton } from "@babylonjs/core";
import { assertIsDefined } from "./main";

type HierarchicalAnimationNode = {
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
  const constructHierarchy = (bone: Bone, node: HierarchicalBoneDataNode) => {
    node.data = {
      id: bone.getIndex(),
      name: bone.name,
    };
    if (bone.children.length === 0) {
      node.children = undefined;
      return node;
    } else {
      node.children = bone.children.map((cbone) =>
        constructHierarchy(cbone, node)
      );
    }
    return node;
  };
  return {
    name: name,
    boneHierarchy: constructHierarchy(rootBone, rootNode),
  };
};

type IsVailedSkeleton = (
  skeleton: Skeleton,
  boneHierarchy: BoneHierarchyBase
) => boolean;

type MakeSkeletonAnimationClip = (
  skeleton: Skeleton,
  boneHierarchy: BoneHierarchyBase
) => SkeletonAnimationClip;
/*
const makeSkeletonAnimationClip: MakeSkeletonAnimationClip = (
  skeleton: Skeleton
): SkeletonAnimationClip => {};
*/
