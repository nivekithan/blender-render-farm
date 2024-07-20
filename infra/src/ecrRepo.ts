import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";
import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import path from "path";

const randomId = new random.RandomInteger("randomIdForImageRepo", {
  min: 1000,
  max: 9999,
});

const nameOfImageRepo = pulumi.interpolate`blender_farm_image_repo_${randomId.id}`;

export const blenderFarmImageRepo = new aws.ecr.Repository(
  "BlenderFramImageRepo",
  {
    forceDelete: true,
    imageScanningConfiguration: {
      scanOnPush: false,
    },
    name: nameOfImageRepo,
  },
);

const blenderRendererDir = path.resolve(
  process.cwd(),
  "..",
  "blender-renderer",
);

export const blenderRendererImage = new awsx.ecr.Image("blenderFarmRenderer", {
  repositoryUrl: blenderFarmImageRepo.repositoryUrl,
  context: blenderRendererDir,
  imageTag: "latest",
  platform: "linux/amd64",
  imageName: "blender-renderer",
});

const zipFramesDir = path.resolve(process.cwd(), "..", "zip-frames");

export const zipFramesImage = new awsx.ecr.Image("zipFrames", {
  repositoryUrl: blenderFarmImageRepo.repositoryUrl,
  context: zipFramesDir,
  imageTag: "latest",
  platform: "linux/amd64",
  imageName: "zip-frames",
});
