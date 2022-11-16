import { Bone, IAnimatable, Animation } from "@babylonjs/core";
import { assertIsDefined } from "../main";
import { PowerSkeleton, SkeletonHash } from "./powerSkeleton";

type HierarchicalAnimationNode = {
  id: number;
  animation: Animation;
  children: HierarchicalAnimationNode[] | undefined;
};

export class SkeletalAnimation {
  public readonly skeletonHash: SkeletonHash[];
  public readonly groupId: string;
  public readonly name: string;
  private readonly _animData: HierarchicalAnimationNode;
  constructor(skeleton: PowerSkeleton, name: string) {
    this.skeletonHash = skeleton.skeletonHash;
    this.groupId = skeleton.groupId;
    this._animData = this._makeSkeletalAnimationData(skeleton);
    this.name = name;
  }

  public getAnimationArray(): Animation[] {
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
    travarseAnims(this._animData);
    return anims;
  }

  private _makeSkeletalAnimationData(
    powerSkeleton: PowerSkeleton
  ): HierarchicalAnimationNode {
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
    const rootBone = powerSkeleton.skeleton.bones[0];
    assertIsDefined(rootBone);
    return constructAnimation(
      rootBone,
      powerSkeleton.skeleton.getAnimatables()
    );
  }
}
