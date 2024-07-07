import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";
import * as pulumi from "@pulumi/pulumi";

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
