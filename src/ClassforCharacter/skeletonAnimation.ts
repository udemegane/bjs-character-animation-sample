import { Skeleton } from "@babylonjs/core";
import { PowerSkeleton, SkeletonHash } from "./powerSkeleton";

type HierarchicalAnimationNode = {
  id: number;
  animation: Animation;
  children: HierarchicalAnimationNode[] | undefined;
};

export class SkeletalAnimation {
  public readonly skeletonHash: SkeletonHash;
  private readonly _animData: HierarchicalAnimationNode;
  constructor(skeleton: PowerSkeleton) {
    this.skeletonHash = skeleton.skeletonHash;
    this._animData = this._makeSkeletalAnimationData(skeleton);
  }

  private _makeSkeletalAnimationData(
    skeleton: PowerSkeleton
  ): HierarchicalAnimationNode {}
}
