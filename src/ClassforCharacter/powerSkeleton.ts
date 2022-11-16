/* eslint-disable camelcase */
import { Bone, Skeleton, TransformNode } from "@babylonjs/core";
import { assertIsDefined } from "../main";
import { SkeletalAnimation } from "./skeletonAnimation";
export type SkeletonHash = {
  id: number; // このスケルトンのボーンのid
  baseId: number; // ベーススケルトンのボーンのid
  value: "(" | ")";
};
const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export class PowerSkeleton {
  public readonly basePowerSkeleton: PowerSkeleton;
  public readonly skeleton: Skeleton;
  public readonly skeletonHash: SkeletonHash[];
  public readonly groupId: string;
  constructor(skeleton: Skeleton, basePowerSkeleton?: PowerSkeleton) {
    this.skeleton = skeleton;
    const hash = this._makeSkeletonHash(skeleton);
    // 元スケルトンがない場合、自身をそれに設定
    if (!basePowerSkeleton) {
      this.basePowerSkeleton = this;
      hash.forEach((h) => (h.baseId = h.id));
      this.skeletonHash = hash.map((h) => Object.freeze(h));
      this.groupId = uuid();
    } else {
      // 元スケルトンがある場合、互換性があるか確認
      if (this._isValiedSkeleton(hash, basePowerSkeleton.skeletonHash)) {
        this.basePowerSkeleton = basePowerSkeleton;

        this.skeletonHash = this._setBaseId(
          hash,
          basePowerSkeleton.skeletonHash
        ).map((h) => Object.freeze(h));

        this.groupId = basePowerSkeleton.groupId;
      } else {
        throw new Error("Not compatible with basePowerSkeleton.");
      }
    }
    // this.skeleton = skeleton.clone("powerSkeleton");
  }

  /**
   * mergeSkeletons
   */
  /*
  public static MergeSkeletons(skeletons: PowerSkeleton[]): PowerSkeleton {
    const groupIdList = skeletons.map((s) => s.groupId);
    if (!groupIdList.every((id) => id === groupIdList[0])) {
      throw new Error(
        `The ${groupIdList.length} skeletons given belong to different groups.`
      );
    }
  }
  */

  // public getAnimationClip(): SkeletalAnimation {}

  public createLinkedTransformNode(): TransformNode[] {
    const scene = this.skeleton.getScene();
    return this.skeleton.bones.map((bone) => {
      const node = new TransformNode(bone.name, scene, true);
      bone.linkTransformNode(node);
      return node;
    });
  }

  // public isValiedAnimation(anim: SkeletalAnimation): boolean {}

  private _makeSkeletonHash(skeleton: Skeleton): SkeletonHash[] {
    const constructHash = (bone: Bone): SkeletonHash[] => {
      if (bone.children.length === 0) {
        return [
          {
            id: bone.getIndex(),
            baseId: -1,
            value: "(",
          },
          {
            id: bone.getIndex(),
            baseId: -1,
            value: ")",
          },
        ];
      } else {
        const childrenHash = bone.children
          .map((childbone) => constructHash(childbone))
          .sort((a, b) => {
            const str_a = a.map((h) => h.value).join("");
            const str_b = b.map((h) => h.value).join("");
            return str_a.localeCompare(str_b);
          })
          .reduce((acc, cur) => {
            acc.push(...cur);
            return acc;
          });
        childrenHash.unshift({
          id: bone.getIndex(),
          baseId: -1,
          value: "(",
        });
        childrenHash.push({
          id: bone.getIndex(),
          baseId: -1,
          value: ")",
        });
        return childrenHash;
      }
    };

    const rootBone = ((maybeBone) => {
      assertIsDefined(maybeBone);
      return maybeBone;
    })(skeleton.bones[0]);

    return constructHash(rootBone);
  }

  private _freezeHash(skHash: SkeletonHash[]) {
    return Object.freeze(skHash.map((h) => Object.freeze(h)));
  }

  private _isValiedSkeleton(
    hash_1: SkeletonHash[],
    hash_2: SkeletonHash[]
  ): boolean {
    const [longerHash, shooterHash] = (() => {
      if (hash_1.length > hash_2.length) {
        return [hash_1, hash_2];
      } else {
        return [hash_2, hash_1];
      }
    })();
    const hashSequence = ((hash) => {
      function* gen() {
        yield* hash;
      }
      return gen();
    })(longerHash);

    let isValied = true;
    // 小さいほうのスケルトンが大きいスケルトンのサブセットであることを確認する
    for (let i = 0; i < shooterHash.length; i++) {
      const hshooter = shooterHash[i];
      assertIsDefined(hshooter);
      const next = hashSequence.next();
      if (next.done) {
        break;
      }
      const hlonger = next.value;
      if (hshooter.value === hlonger.value) {
        continue;
      } else {
        // ここの節は、一致しないハッシュから始まるボーン階層が簡潔したサブツリーであることを確認し、
        // それを取り除いた部分が一致するか考える
        let surplus = hlonger.value === "(" ? 1 : -1;
        while (1) {
          const next = hashSequence.next();
          if (next.done) {
            break;
          }
          const hlonger = next.value;
          if (hlonger.value === "(") {
            surplus++;
          } else {
            surplus--;
          }
          if (surplus < 0) {
            const hshooterNext = shooterHash[++i];
            assertIsDefined(hshooterNext);
            if (hshooterNext.value === next.value.value) {
              continue;
            } else {
              isValied = false;
              break;
            }
          } else {
            continue;
          }
        }
      }
    }
    return isValied;
  }

  private _setBaseId(
    hash: SkeletonHash[],
    baseHash: SkeletonHash[]
  ): SkeletonHash[] {
    let i = 0;
    let ib = 0;
    const isLongerThanBase = hash.length > baseHash.length;
    const max = isLongerThanBase ? hash.length : baseHash.length;
    while (!(i >= max || ib >= max)) {
      const h = hash[i];
      const hb = baseHash[ib];
      assertIsDefined(h);
      assertIsDefined(hb);
      if (h.value === hb.value) {
        h.baseId = hb.id;
        i++;
        ib++;
      } else {
        let surplus = 0;
        if (isLongerThanBase) {
          while (1) {
            const h = hash[i];
            assertIsDefined(h);
            if (h.value === "(") {
              surplus++;
            } else {
              surplus--;
            }
            if (surplus < 0) {
              break;
            } else {
              i++;
            }
          }
        } else {
          while (1) {
            const hb = baseHash[ib];
            assertIsDefined(hb);
            if (hb.value === "(") {
              surplus++;
            } else {
              surplus--;
            }
            if (surplus < 0) {
              break;
            } else {
              ib++;
            }
          }
        }
      }
    }
    return hash;
  }

  // private _
}
