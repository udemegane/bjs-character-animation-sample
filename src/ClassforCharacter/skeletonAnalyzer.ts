import {
  ISceneLoaderAsyncResult,
  Mesh,
  Scene,
  SceneLoader,
  Skeleton,
  Bone,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { assertIsDefined, colors } from "../main";

type BoneHash = {
  id: number; // このスケルトンのボーンのid
  baseId: number; // ベーススケルトンのボーンのid
  value: 0 | 1;
};
export type SkeletonHash = {
  bones: BoneHash[];
  groupId: number;
};
type SkeletonMetadata = {
  bones: BoneHash[];
  groupId: string;
  name: string;
  type: "Animation" | "Model";
};
export class SkeletonAnalyzer {
  public static AnalyzeFromFileAsync(
    filename: string,
    saveMetadata = true,
    extractAnimation = true,
    baseResource?: string | SkeletonMetadata
  ) {}
  //  const scene

  public static Analyze(
    skeleton: Skeleton,
    saveMetadata = true,
    extractAnimation = true,
    baseSkeleton?: SkeletonMetadata
  ): SkeletonMetadata {
    const uuid = () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    console.info(colors.white(`Analyzing skeleton "${skeleton.name}"...`));
    const hash = SkeletonAnalyzer._MakeBoneHash(skeleton);
    if (baseSkeleton) {
      console.info(
        colors.white(
          `Check Bone hieralchy compatibility of ${skeleton.name} and ${baseSkeleton.name}...`
        )
      );
      if (SkeletonAnalyzer._isValiedSkeleton(hash, baseSkeleton.bones)) {
        console.info(colors.green(`Compatible!`));
        return Object.freeze({
          bones: hash,
          groupId: baseSkeleton.groupId,
          name: skeleton.name,
          type: "Model",
        });
      } else {
        console.warn(
          colors.yellow(`Not Compatible. Make new skeleton group id.`)
        );
      }
    }
    console.info(colors.white(`Make new skeleton group id.`));
    console.info(colors.white(`Done.`));
    return Object.freeze({
      bones: hash,
      groupId: uuid(),
      name: skeleton.name,
      type: "Model",
    });
  }

  private static _MakeBoneHash(skeleton: Skeleton): BoneHash[] {
    console.info(colors.white(`Create Bone hierarchy array...`));
    const constructHash = (bone: Bone): BoneHash[] => {
      if (bone.children.length === 0) {
        return [
          {
            id: bone.getIndex(),
            baseId: -1,
            value: 0,
          },
          {
            id: bone.getIndex(),
            baseId: -1,
            value: 1,
          },
        ];
      } else {
        // あるボーンの子要素のボーンツリーを再帰的にソートする
        // localecompareしてるので構造が一致すれば列は一意に定まるはず
        const childrenHash = bone.children
          .map((childbone) => constructHash(childbone))
          .sort((a, b) => {
            const str1 = a.map((h) => h.value).join("");
            const str2 = b.map((h) => h.value).join("");
            return str1.localeCompare(str2);
          })
          .reduce((acc, cur) => {
            acc.push(...cur);
            return acc;
          });
        // この呼び出しに対応するボーンのハッシュを埋め込む
        childrenHash.unshift({
          id: bone.getIndex(),
          baseId: -1,
          value: 0,
        });
        childrenHash.push({
          id: bone.getIndex(),
          baseId: -1,
          value: 1,
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

  private static _isValiedSkeleton(
    hash1: BoneHash[],
    hash2: BoneHash[]
  ): boolean {
    const [longerHash, shooterHash] = (() => {
      if (hash1.length > hash2.length) {
        return [hash1, hash2];
      } else {
        return [hash2, hash1];
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
        let surplus = hlonger.value === 0 ? 1 : -1;
        while (1) {
          const next = hashSequence.next();
          if (next.done) {
            break;
          }
          const hlonger = next.value;
          if (hlonger.value & 0) {
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

  private static _SaveMetadata(metadata: SkeletonMetadata) {}
}
