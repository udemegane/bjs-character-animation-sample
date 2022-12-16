import { Skeleton, Animatable } from "@babylonjs/core";
import { AnimData } from "./codegenSample";
export type transitOptions = {
  duration: number;
};

type BoneHash = {
  id: number; // このスケルトンのボーンのid
  baseId: number; // ベーススケルトンのボーンのid
  value: 0 | 1;
};

export type SkeletonMetadata = {
  bones: BoneHash[];
  groupId: string;
  isNewGroup: boolean;
  name: string;
  fileName: string;
  type: "Animation" | "Model";
};

export class SkeletalMesh {
  public skeleton: Skeleton;
  private _animatables: Animatable[] = [];
  constructor(
    animsData: AnimData[],
    skeleton: Skeleton,
    metadata: SkeletonMetadata,
    baseSkMetadata: SkeletonMetadata
  ) {
    this.skeleton = skeleton;
    this._extractAnimatable(animsData, metadata, baseSkMetadata);
  }

  public static async LoadSkeletalMeshAsync(
    root: string,
    file: string
  ): Promise<SkeletalMesh> {}

  public dispose() {}

  public playAnimation(
    sequence: number,
    loop: boolean = true,
    speedRatio: number = 1.0,
    options?: transitOptions
  ) {}

  private async _extractAnimatable(
    animsData: AnimData[],
    metadata: SkeletonMetadata,
    baseSkMetadata: SkeletonMetadata
  ) {}
}
